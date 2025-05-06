import {Database} from "../types/supabase"
import { createClient } from '@supabase/supabase-js';
const db_url = import.meta.env.WXT_SUPABASE_URL!
const db_api_key = import.meta.env.WXT_SUPABASE_API_KEY!
const supabase = createClient<Database>(`${db_url}`, `${db_api_key}`)

export async function getCandidate(email:string) {

  try {
    // console.log(supabase,db_url,db_api_key)

    const { data , error } = await supabase
      .from('candidates')
      .select()
      .eq('email', email)

    // alert(error+'api')

    // console.error(error)
    return data

  } catch (error) {
    console.error(error)
  }

}

export async function generateChatResponse(data: any, JD: string, client: any):Promise<string> {

  console.log(JSON.stringify(data))

  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{
      role: 'user',

      // content:Hey Mistral, Can you read and print a json ? If yes read and print it . ### JSON: ${JSON.stringify(data)}

      content: `
          # Job description : ${JD} 
          # Candidate : ${JSON.stringify(data)} 
          
          # Write a suitable cover letter for the candidate using candidate's information. Don't provide a template. Tailor it according to the provided candidate's information. Use minute details such as candidate's address , phone number, candidate's name etc. to write a good cover letter. 
          ###Caution : Wherever you find null leave that field.`
    }],
  });

  return response.choices?.[0].message?.content


}


