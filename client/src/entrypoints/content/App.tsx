import { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getCandidate } from "../../server/API";
import { convert_to_readable, convert_to_readable_input, toInputBox, convert_to_downloadable_pdf } from "@/utils/helpers";
import { JD } from '@/types'
import { jsPDF } from "jspdf";
import QuillToPdf from "quill-to-pdf";
import { saveAs } from "file-saver";
import {mistral} from "@/utils/mistral"




const App = ({ JD, messageBox }: JD) => {

  const [content, setContent] = useState<string>(`Crafting your letter ... \n`);
  const [rawContent, setRawContent] = useState<string>('')
  const [hide, setHide] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const quillRef = useRef<ReactQuill>(null);


  let fullResponse: string = "";
  let cleanResponse: string;

  async function generateChatResponseStream(data: any, JD: string, client: any) {

    try {
      console.log(JD, data)

      const response = await client.chat.stream({
        model: 'mistral-large-latest',
        messages: [{
          role: 'user',
          content: `
          # Job description : ${JD} 
          # Candidate : ${JSON.stringify(data)} 
          
          # Write a suitable cover letter for the candidate using candidate's information. Don't provide a template. Tailor it according to the provided candidate's information. Use minute details such as candidate's address , phone number, candidate's name etc. to write a good cover letter. 
          ###Caution : Wherever you find null leave that field.
          ###Caution : Do not exceed more than 250 words

          - Avoid using "null" in any part of the cover letter. Skip missing fields without mentioning them.
          - Format the letter properly with paragraphs and line breaks.
          - Tailor the letter according to the job description and candidate's profile.
          _ Add available url links in the cover letter.
          
          `
        }],
      });

      setStreaming(true)

      for await (const chunk of response) {
        // console.log(chunk)
        const streamText = chunk.data.choices[0].delta.content;
        // Append the new chunk to the buffer
        fullResponse += streamText;
        // Filter null fields and clean up formatting
        cleanResponse = fullResponse
          .replace(/\n/g, "<br>")
          .trim(); // Trim whitespace from the beginning and end
        // Update the state with the full response so far
        setContent(cleanResponse); // Set the state with the accumulated response
        // console.log(cleanResponse)
      }

    } catch (err) {
      setStreaming(false)
      setContent((content) => content + 'error')
      alert(err)
    } finally {
      setStreaming(false)
      return cleanResponse
    }



  }

  async function generateCover() {

    const user = await chrome.storage.local.get(['user'])
    const email = user.user.email
    const candidate = await getCandidate(email)
    // console.log(candidate)

    const result = await generateChatResponseStream(candidate, JD, mistral)
    console.log(result)
    setRawContent(result)
    const readable_input = convert_to_readable_input(result)
    const readable = convert_to_readable(readable_input)
    setContent(readable)

  }



  useEffect(() => {

    generateCover()

  }, [JD])

  const downloadPDF = async() => {
    // Initialize PDF document
    console.log(content)
    console.log(rawContent)
    console.log(convert_to_readable_input(rawContent))

    // doc.text(convert_to_downloadable_pdf(rawContent), 20, 20);
    // doc.save("cover_letter.pdf");
   
    // // Create a new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // Set font and size to match a typical letter appearance
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Define layout parameters (in points, where 1 inch = 72 pt)
    const leftMargin = 72; // 1-inch left margin
    const rightMargin = 72; // 1-inch right margin
    const textWidth = 595 - leftMargin - rightMargin; // A4 width is 595 pt
    const lineHeight = 15; // Space between lines
    const paragraphSpacing = 10; // Extra space between paragraphs/sections
    let y = 72; // Starting y-position (1-inch top margin)

    // Split the cover letter into lines
    const lines = rawContent.split('<br>');
    doc.text(lines, 72, 72, { maxWidth: 451 });

    // // Group consecutive non-empty lines into blocks
    // // let block:string[] = [];
    // // lines.forEach(line => {
    // //   if (line.trim() !== '') {
    // //     // Add non-empty lines to the current block
    // //     block.push(line);
    // //   } else {
    // //     // Process the block when hitting a blank line
    // //     if (block.length > 0) {
    // //       block.forEach(blockLine => {
    // //         // Wrap text to fit within textWidth
    // //         const wrappedLines = doc.splitTextToSize(blockLine, textWidth);
    // //         wrappedLines.forEach((wrappedLine: string) => {
    // //           doc.text(wrappedLine, leftMargin, y);
    // //           y += lineHeight;
    // //         });
    // //       });
    // //       // Add extra spacing after the block
    // //       y += paragraphSpacing;
    // //       block = []; // Reset the block
    // //     }
    // //   }
    // // });

    // // // Process any remaining block after the loop
    // // if (block.length > 0) {
    // //   block.forEach(blockLine => {
    // //     const wrappedLines = doc.splitTextToSize(blockLine, textWidth);
    // //     wrappedLines.forEach((wrappedLine:string) => {
    // //       doc.text(wrappedLine, leftMargin, y);
    // //       y += lineHeight;
    // //     });
    // //   });
    // // }

    // Save and download the PDF
    doc.save('cover_letter.pdf');


  };



  const handleChange = (value: string, delta: any, source: any, editor: any): void => {
    setContent(value);
    
    // Get the text content without HTML tags
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Replace newlines with <br> tags for rawContent
    const formattedContent = textContent.replace(/\n/g, '<br>');
    setRawContent(formattedContent);
};

  if (hide !== false) {
    return <></>

  }


  return (

    <>
      {/* Modal */}
      <div
        id='modal backdrop'
        className={`fixed top-0 left-0 flex items-center justify-center w-screen h-screen bg-slate-300/20 backdrop-blur-sm`}
        style={{
          zIndex: 500
        }}
        aria-labelledby="header-2a content-2a"
        aria-modal="true"
        tab-index="-1"
        role="dialog">


        <div
          id='modal'
          className="flex max-h-[90vh] w-6/12  flex-col gap-6 overflow-hidden rounded-xl bg-white p-6 text-slate-500 shadow-xl shadow-slate-700/10">

          <header
            id="modal-header"
            className="flex items-center gap-4">
            <h3 className="flex-1 text-xl font-medium text-slate-700">Tailor your cover letter</h3>
            <button onClick={() => setHide(true)} className="inline-flex items-center justify-center h-10 gap-2 px-5 text-sm font-medium tracking-wide transition duration-300 rounded-full focus-visible:outline-none justify-self-center whitespace-nowrap text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 focus:bg-emerald-200 focus:text-emerald-700 disabled:cursor-not-allowed disabled:text-emerald-300 disabled:shadow-none disabled:hover:bg-transparent" id="modal" role="document" aria-label="close dialog">
              <span className="relative only:-mx-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" role="graphics-symbol" aria-labelledby="title-79 desc-79">
                  <title id="title-79">Icon title</title>
                  <desc id="desc-79">A more detailed description of the icon</desc>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            </button>
          </header>

          {/* modal body */}
          <div id="content-2a" className="flex-1 overflow-auto">
            {/* text editor */}
            <ReactQuill theme="snow" value={content} onChange={handleChange} ref={quillRef} />


          </div>

          <div className="flex justify-end gap-2">

            <button
              className="inline-flex items-center justify-center h-10 gap-2 px-5 text-sm font-medium tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 focus:bg-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none"
              disabled={streaming}
              onClick={() => {
                setHide(true)
                messageBox.innerHTML = toInputBox(content)
              }}
            >
              <span>Continue</span>
            </button>

            <button
              className="inline-flex items-center justify-center h-10 gap-2 px-5 text-sm font-medium tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 focus:bg-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none"
              onClick={downloadPDF}
            >
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </>

  );
};

export default App