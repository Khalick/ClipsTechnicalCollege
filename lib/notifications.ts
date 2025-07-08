import { supabaseAdmin } from '@/lib/supabase-client'

/**
 * Sends a notification to a student about a financial update
 * 
 * @param studentId The ID of the student to notify
 * @param title The notification title
 * @param message The notification message
 * @param type The type of notification ('fee_billing', 'payment_received', 'fee_update')
 * @returns Promise resolving to the notification record or null
 */
export async function sendFinancialNotification(
  studentId: number,
  title: string, 
  message: string,
  type: 'fee_billing' | 'payment_received' | 'fee_update'
) {
  try {
    // Check if the student exists
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, name, email')
      .eq('id', studentId)
      .single()

    if (studentError || !student) {
      console.error('Student not found for notification:', studentError)
      return null
    }

    // Insert notification into notifications table
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: studentId.toString(),
        title,
        message,
        type,
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    // You could add email notification here in the future
    
    return data
  } catch (error) {
    console.error('Error in sendFinancialNotification:', error)
    return null
  }
}
