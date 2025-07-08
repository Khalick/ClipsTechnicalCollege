import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-client'
import { sendFinancialNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('POST /api/admin/fees - Request body:', requestBody)
    
    const { student_id, semester, total_fee, total_billed, amount_paid, due_date, force_update } = requestBody
    
    // Allow either total_fee or total_billed field for flexibility
    const feeAmount = total_fee || total_billed

    if (!student_id || !semester || !feeAmount) {
      console.error('Missing required fields for fee creation:', { 
        student_id_provided: !!student_id, 
        semester_provided: !!semester, 
        total_fee_provided: !!feeAmount 
      })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if a fee record already exists for this student and semester
    const { data: existingFee, error: checkError } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', student_id)
      .eq('semester', semester)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking for existing fee record:', checkError)
      return NextResponse.json({ error: 'Failed to check for existing fee record' }, { status: 500 })
    }

    // If a record exists and force_update is not enabled, return an informative message
    if (existingFee && !force_update) {
      return NextResponse.json({ 
        warning: 'Student already billed for this semester',
        message: 'This student has already been billed for this semester. Use force_update=true to update the existing record.',
        existing_record: existingFee
      }, { status: 200 })
    }

    // Insert or update fee record
    const { data, error } = await supabase
      .from('fees')
      .upsert({
        student_id,
        semester,
        total_billed: feeAmount,
        total_paid: amount_paid || 0,
        due_date: due_date || null,
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error creating fee record:', error)
      return NextResponse.json({ error: 'Failed to create fee record' }, { status: 500 })
    }

    // Send notification to student
    await sendFinancialNotification(
      student_id,
      'Fee Statement Updated',
      `Your fee statement for ${semester} has been updated. Total billed: KES ${feeAmount.toLocaleString()}.`,
      'fee_billing'
    )

    const isNewRecord = !existingFee
    return NextResponse.json({ 
      success: true, 
      data, 
      message: isNewRecord ? 'Fee record created successfully' : 'Fee record updated successfully' 
    })
  } catch (error) {
    console.error('Error in fee creation API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get('semester')

    let query = supabase
      .from('fees')
      .select(`
        *,
        students!inner(
          id,
          name,
          registration_number,
          course
        )
      `)
      .order('created_at', { ascending: false })

    if (semester) {
      query = query.eq('semester', semester)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching fees:', error)
      return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in fees API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Add bulk billing endpoint
export async function PATCH(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('PATCH /api/admin/fees - Request body:', requestBody)
    
    const { action, data } = requestBody
    
    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Data is required' }, { status: 400 })
    }

    if (action === 'bulk_bill') {
      const { student_ids, semester, total_fee, due_date, skip_existing = false } = data
      
      console.log('Bulk billing - Parameters:', { 
        student_count: student_ids?.length, 
        semester, 
        total_fee, 
        due_date,
        skip_existing
      })

      if (!student_ids || !Array.isArray(student_ids) || !semester || !total_fee) {
        return NextResponse.json({ 
          error: 'Missing required fields for bulk billing', 
          required: { student_ids: 'array', semester: 'string', total_fee: 'number' } 
        }, { status: 400 })
      }
      
      // Check which students already have fee records for this semester
      const { data: existingRecords, error: checkError } = await supabase
        .from('fees')
        .select('student_id')
        .eq('semester', semester)
        .in('student_id', student_ids)
      
      if (checkError) {
        console.error('Error checking existing fee records:', checkError)
        return NextResponse.json({ error: 'Failed to check existing fee records' }, { status: 500 })
      }
      
      // Create a set of student IDs that already have records
      const alreadyBilledStudents = new Set(existingRecords?.map(r => r.student_id) || [])
      
      // Filter out students who already have fee records if skip_existing is true
      const studentsToProcess = skip_existing 
        ? student_ids.filter(id => !alreadyBilledStudents.has(id))
        : student_ids
      
      if (studentsToProcess.length === 0) {
        return NextResponse.json({ 
          success: false, 
          warning: 'No students to bill', 
          message: 'All selected students have already been billed for this semester.',
          already_billed_count: alreadyBilledStudents.size,
          already_billed_students: Array.from(alreadyBilledStudents)
        })
      }
      
      // Prepare batch upsert data
      const batchData = studentsToProcess.map(student_id => ({
        student_id,
        semester,
        total_billed: total_fee, // Use total_fee value but store as total_billed
        total_paid: 0, // Initialize with zero payment
        due_date: due_date || null,
        updated_at: new Date().toISOString()
      }))
      
      // Perform bulk upsert
      const { data: result, error } = await supabase
        .from('fees')
        .upsert(batchData, { 
          onConflict: 'student_id,semester',
          ignoreDuplicates: false
        })
        .select()
      
      if (error) {
        console.error('Error in bulk billing:', error)
        return NextResponse.json({ error: 'Failed to process bulk billing' }, { status: 500 })
      }
      
      // Send notifications to processed students
      for (const studentId of studentsToProcess) {
        await sendFinancialNotification(
          studentId,
          'New Fee Statement',
          `Your fee statement for ${semester} has been generated. Total billed: KES ${total_fee.toLocaleString()}.`,
          'fee_billing'
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Successfully billed ${studentsToProcess.length} students`,
        processed_count: studentsToProcess.length,
        skipped_count: student_ids.length - studentsToProcess.length,
        already_billed_students: Array.from(alreadyBilledStudents),
        data: result
      })
    }
    
    else if (action === 'update_fee') {
      const { fee_id, total_fee, due_date } = data
      
      if (!fee_id || !total_fee) {
        return NextResponse.json({ 
          error: 'Missing required fields for fee update', 
          required: { fee_id: 'number', total_fee: 'number' } 
        }, { status: 400 })
      }
      
      // First check if the fee record exists
      const { data: existingFee, error: checkError } = await supabase
        .from('fees')
        .select('*')
        .eq('id', fee_id)
        .single()
        
      if (checkError) {
        if (checkError.code === 'PGRST116') { // Not found error
          return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
        } else {
          console.error('Error checking fee record:', checkError)
          return NextResponse.json({ error: 'Failed to check fee record' }, { status: 500 })
        }
      }
      
      // Update fee record
      const { data: result, error } = await supabase
        .from('fees')
        .update({
          total_billed: total_fee,
          due_date: due_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', fee_id)
        .select()
      
      if (error) {
        console.error('Error updating fee:', error)
        return NextResponse.json({ error: 'Failed to update fee record' }, { status: 500 })
      }
      
      // Get student ID from the fee record
      if (result && result.length > 0) {
        const studentId = result[0].student_id
        const semesterInfo = result[0].semester
        
        // Send notification to student
        await sendFinancialNotification(
          studentId,
          'Fee Statement Updated',
          `Your fee statement for ${semesterInfo} has been updated. Total billed: KES ${total_fee.toLocaleString()}.`,
          'fee_update'
        )
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Fee record updated successfully',
        previous_amount: existingFee.total_billed || existingFee.total_fee,
        new_amount: total_fee,
        data: result
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error) {
    console.error('Error in fees API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Record payment made by student
export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('PUT /api/admin/fees - Recording payment:', requestBody)
    
    const { student_id, semester, payment_amount, payment_method, payment_date, reference_number, description } = requestBody

    // Validate required fields
    if (!student_id || !semester || !payment_amount) {
      return NextResponse.json({ error: 'Missing required fields: student_id, semester, and payment_amount are required' }, { status: 400 })
    }

    // Get student details
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('reg_number, email, name')
      .eq('id', student_id)
      .single()

    if (studentError || !studentData) {
      console.error('Error fetching student details:', studentError)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get current fee record
    const { data: currentFee, error: feeError } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', student_id)
      .eq('semester', semester)
      .single()

    if (feeError && feeError.code !== 'PGRST116') { // PGRST116 is not found
      console.error('Error fetching fee record:', feeError)
      return NextResponse.json({ error: 'Error fetching fee record' }, { status: 500 })
    }

    if (!currentFee) {
      return NextResponse.json({ error: 'No fee record exists for this student and semester' }, { status: 404 })
    }

    // Record the payment
    const { data: paymentData, error: paymentError } = await supabase
      .from('fee_payments')
      .insert({
        student_id,
        semester,
        amount: payment_amount,
        payment_method: payment_method || 'admin_recorded',
        payment_date: payment_date || new Date().toISOString(),
        reference_number: reference_number || `ADM-${Date.now()}`,
        description: description || 'Payment recorded by administrator',
        status: 'completed',
        created_at: new Date().toISOString()
      })
      .select()

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    // Update fee record with new total_paid
    const newTotalPaid = (currentFee.total_paid || 0) + payment_amount
    const { data: updatedFee, error: updateError } = await supabase
      .from('fees')
      .update({
        total_paid: newTotalPaid,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', student_id)
      .eq('semester', semester)
      .select()

    if (updateError) {
      console.error('Error updating fee record:', updateError)
      return NextResponse.json({ error: 'Failed to update fee record' }, { status: 500 })
    }

    // Send notification to student
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: student_id,
          title: 'Payment Recorded',
          message: `A payment of ${payment_amount} has been recorded for your ${semester} semester fees.`,
          type: 'fee_payment',
          is_read: false,
          created_at: new Date().toISOString()
        })

      if (notificationError) {
        console.error('Error creating notification:', notificationError)
      }
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError)
    }

    // Return success response with updated data
    return NextResponse.json({
      success: true,
      payment: paymentData?.[0],
      updated_fee: updatedFee?.[0],
      message: `Payment of ${payment_amount} recorded successfully for ${studentData.name} (${studentData.reg_number})`
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/fees:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
