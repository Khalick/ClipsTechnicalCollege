const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function updateStudentPhotos() {
  console.log('🔍 Updating student photos...')
  
  try {
    // Sample photo URLs from Unsplash
    const photoUpdates = [
      {
        registration_number: 'STU001',
        photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        registration_number: 'STU002',
        photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b9a2f7bb?w=150&h=150&fit=crop&crop=face'
      },
      {
        registration_number: 'CS001',
        photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        registration_number: 'CS002',
        photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        registration_number: 'CS003',
        photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
      }
    ]
    
    // Update each student's photo
    for (const update of photoUpdates) {
      const { data, error } = await supabase
        .from('students')
        .update({ photo_url: update.photo_url })
        .eq('registration_number', update.registration_number)
      
      if (error) {
        console.error(`❌ Failed to update photo for ${update.registration_number}:`, error)
      } else {
        console.log(`✅ Updated photo for ${update.registration_number}`)
      }
    }
    
    // Set placeholder photo for any students without photos
    const { data: placeholderUpdate, error: placeholderError } = await supabase
      .from('students')
      .update({ photo_url: '/placeholder-user.jpg' })
      .is('photo_url', null)
    
    if (placeholderError) {
      console.error('❌ Failed to set placeholder photos:', placeholderError)
    } else {
      console.log('✅ Set placeholder photos for students without photos')
    }
    
    // Display updated records
    const { data: students, error: fetchError } = await supabase
      .from('students')
      .select('registration_number, name, photo_url')
      .not('photo_url', 'is', null)
    
    if (fetchError) {
      console.error('❌ Failed to fetch updated students:', fetchError)
    } else {
      console.log('\n📋 Updated students:')
      students.forEach(student => {
        console.log(`  ${student.registration_number}: ${student.name} -> ${student.photo_url}`)
      })
    }
    
    console.log('\n✅ Photo update completed!')
    
  } catch (error) {
    console.error('❌ Error updating photos:', error)
  }
}

updateStudentPhotos()
