import { useState, useRef, useMemo } from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {cover} from '@/types'


const ModalActionButton = ({coverLetter,generating}:cover) => {

    const editor = useRef(null);
    const [content, setContent] = useState<string>('');
    const [hide,setHide] = useState<boolean>(true)

    useEffect(()=>{
       setContent(coverLetter)
       console.log(coverLetter)
    },[coverLetter])


    return (
        <>
            {/* Component: Modal with title, text and an action button  */}

           !hide
           &&


            <div
                id='modal backdrop'
                className={`fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-slate-300/20 backdrop-blur-sm`}
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
                        <button onClick={()=>setHide(true)} className="inline-flex items-center justify-center h-10 gap-2 px-5 text-sm font-medium tracking-wide transition duration-300 rounded-full focus-visible:outline-none justify-self-center whitespace-nowrap text-emerald-500 hover:bg-emerald-100 hover:text-emerald-600 focus:bg-emerald-200 focus:text-emerald-700 disabled:cursor-not-allowed disabled:text-emerald-300 disabled:shadow-none disabled:hover:bg-transparent" id="modal" role="document" aria-label="close dialog">
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
                        <ReactQuill 
                        theme="snow" 
                        value={
                            content.length>1 ? content : 'Crafting your cover letter'
                        } 
                        onChange={setContent}
                        />
                    </div>

                    <div className="flex justify-end gap-2">

                        <button className="inline-flex items-center justify-center h-10 gap-2 px-5 text-sm font-medium tracking-wide text-white transition duration-300 rounded focus-visible:outline-none whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 focus:bg-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300 disabled:shadow-none">
                            <span>Continue</span>
                        </button>
                    </div>
                </div>
            </div>
        </>

    )
}

export default ModalActionButton