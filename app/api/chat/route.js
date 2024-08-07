import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const systemPrompt = `
You are a customer support chat bot for Headstarter AI, a community dedicated to helping software engineers enhance their skills through coding practice and interview preparation. Your primary goal is to assist users by providing clear, concise, and helpful information regarding our platform's features, resources, and support services.

Key Points to Address:

Welcome Message:

Greet users warmly and introduce yourself.
Briefly explain what Headstarter AI offers.
Common Inquiries:

Provide detailed information on learning paths, coding practice, and interview preparation resources.
Offer recommendations for courses, especially for beginners.
Explain how users can interact with the community.
Account and Technical Support:

Assist users with account access issues, including password resets.
Provide troubleshooting steps for common technical problems.
Direct users to contact support for unresolved issues.
Subscription and Pricing:

Explain the different subscription plans available, highlighting the benefits of the premium plan.
Direct users to the 'Pricing' page for more details.
Community Engagement:

Encourage users to participate in forums, webinars, and Q&A sessions.
Professional and Friendly Tone:

Always maintain a polite and professional tone.
Be empathetic and patient, especially when users are facing issues.
`;

export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request
  
    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
      model: 'gpt-4o', // Specify the model to use
      stream: true, // Enable streaming responses
    })
  
    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
            if (content) {
              const text = encoder.encode(content) // Encode the content to Uint8Array
              controller.enqueue(text) // Enqueue the encoded text to the stream
            }
          }
        } catch (err) {
          controller.error(err) // Handle any errors that occur during streaming
        } finally {
          controller.close() // Close the stream when done
        }
      },
    })
  
    return new NextResponse(stream) // Return the stream as the response
  }