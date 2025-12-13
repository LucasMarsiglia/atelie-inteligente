'use client'

import { supabase } from '@/lib/supabaseClient'

export default function TesteAuth() {
  async function testar() {
    const { data, error } = await supabase.auth.signUp({
      email: 'debug@teste.com',
      password: '12345678',
    })

    console.log('DATA:', data)
    console.log('ERROR:', error)
    alert(error ? error.message : 'Signup executado')
  }

  return (
    <div style={{ padding: 40 }}>
      <button onClick={testar}>TESTAR AUTH</button>
    </div>
  )
}
