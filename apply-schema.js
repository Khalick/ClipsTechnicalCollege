const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runSchema() {
  try {
    console.log('Reading schema file...')
    const schemaPath = path.join(__dirname, 'scripts', 'supabase-schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('Applying schema to Supabase...')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    let successCount = 0
    let errorCount = 0
    
    for (const statement of statements) {
      try {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.error(`Error executing statement: ${statement.substring(0, 50)}...`)
            console.error(`Error: ${error.message}`)
            errorCount++
          } else {
            successCount++
          }
        }
      } catch (err) {
        console.error(`Error: ${err.message}`)
        errorCount++
      }
    }
    
    console.log(`\\nSchema application completed:`)
    console.log(`✅ Successful statements: ${successCount}`)
    console.log(`❌ Failed statements: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('\\n🎉 Schema applied successfully!')
    } else {
      console.log('\\n⚠️  Some statements failed. Please check the errors above.')
    }
    
  } catch (error) {
    console.error('Error applying schema:', error.message)
    process.exit(1)
  }
}

runSchema()
