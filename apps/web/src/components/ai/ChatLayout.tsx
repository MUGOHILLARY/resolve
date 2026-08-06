import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Send,
  Trash2,
  Bot,
  User,
} from "lucide-react";

import {
  askAI,
  loadHistory,
  clearHistory,
} from "../../services/chatService";

import {
  useChatStore,
} from "../../store/ChatStore";

import TypingIndicator from "./TypingIndicator";


export default function ChatLayout() {

  const {
    messages,
    addMessage,
    setMessages,
    clearMessages,
    loading,
    setLoading,
  } = useChatStore();


  const [input, setInput] =
    useState("");


  const bottomRef =
    useRef<HTMLDivElement | null>(
      null
    );



  /*
  |--------------------------------------------------------------------------
  | Load Previous Conversation
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    async function fetchHistory() {

      try {

        const history =
          await loadHistory();


        setMessages(
          history.map(
            (message, index) => ({
              id:
                message.id ??
                `${Date.now()}-${index}`,

              role:
                message.role,

              content:
                message.content,

              createdAt:
                message.created_at ??
                new Date()
                  .toISOString(),
            })
          )
        );


      } catch (error) {

        console.error(
          "History loading failed:",
          error
        );

      }

    }


    fetchHistory();

  }, [setMessages]);




  /*
  |--------------------------------------------------------------------------
  | Scroll To Latest Message
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages, loading]);





  /*
  |--------------------------------------------------------------------------
  | Send Message
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    e: FormEvent
  ) {

    e.preventDefault();


    const text =
      input.trim();


    if (!text || loading) {
      return;
    }



    addMessage({

      id:
        crypto.randomUUID(),

      role:
        "user",

      content:
        text,

      createdAt:
        new Date()
          .toISOString(),

    });



    setInput("");

    setLoading(true);



    try {


      const reply =
        await askAI(text);



      addMessage({

        id:
          crypto.randomUUID(),

        role:
          "assistant",

        content:
          reply,

        createdAt:
          new Date()
            .toISOString(),

      });



    } catch (error: any) {


      addMessage({

        id:
          crypto.randomUUID(),

        role:
          "assistant",

        content:
          error.message ||
          "Something went wrong.",

        createdAt:
          new Date()
            .toISOString(),

      });



    } finally {

      setLoading(false);

    }

  }





  /*
  |--------------------------------------------------------------------------
  | Clear Conversation
  |--------------------------------------------------------------------------
  */

  async function handleClear() {

    try {

      await clearHistory();

      clearMessages();


    } catch (error) {

      console.error(
        "Clear failed:",
        error
      );

    }

  }





  return (

    <div
      className="
        rounded-2xl
        bg-slate-900
        border
        border-slate-800
        overflow-hidden
      "
    >


      {/* Header */}

      <div
        className="
          flex
          justify-between
          items-center
          px-6
          py-4
          border-b
          border-slate-800
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <div
            className="
              bg-blue-600
              rounded-lg
              p-2
            "
          >

            <Bot
              size={22}
              className="text-white"
            />

          </div>


          <div>

            <h2
              className="
                text-white
                font-semibold
              "
            >
              Resolve AI Coach
            </h2>


            <p
              className="
                text-sm
                text-slate-400
              "
            >
              Your personal recovery companion
            </p>

          </div>


        </div>



        <button

          onClick={handleClear}

          className="
            flex
            items-center
            gap-2
            text-sm
            text-red-400
            hover:text-red-300
          "

        >

          <Trash2 size={16}/>

          Clear

        </button>


      </div>





      {/* Chat Messages */}

      <div
        className="
          h-[500px]
          overflow-y-auto
          p-6
          space-y-5
        "
      >


        {messages.length === 0 && (

          <div
            className="
              text-center
              text-slate-400
              mt-20
            "
          >

            <Bot
              size={42}
              className="
                mx-auto
                mb-4
              "
            />


            <p>
              Start a conversation with Resolve AI Coach.
            </p>


          </div>

        )}





        {messages.map(
          (message) => (

            <div

              key={message.id}

              className={`
                flex
                gap-3
                items-start

                ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }
              `}

            >


              {
                message.role ===
                "assistant" && (

                <Bot
                  size={22}
                  className="
                    text-blue-400
                    mt-1
                  "
                />

              )
              }



              <div
                className={`
                  max-w-[75%]
                  rounded-xl
                  px-4
                  py-3
                  text-sm

                  ${
                    message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 text-slate-200"
                  }
                `}
              >

                {message.content}

              </div>




              {
                message.role ===
                "user" && (

                <User
                  size={22}
                  className="
                    text-slate-400
                    mt-1
                  "
                />

              )
              }


            </div>

          )
        )}




        {loading && (
          <TypingIndicator />
        )}



        <div ref={bottomRef}/>


      </div>





      {/* Input */}

      <form

        onSubmit={handleSubmit}

        className="
          flex
          gap-3
          p-4
          border-t
          border-slate-800
        "

      >


        <textarea

          value={input}

          onChange={(e) =>
            setInput(e.target.value)
          }


          onKeyDown={(e) => {

            if (
              e.key === "Enter" &&
              !e.shiftKey
            ) {

              e.preventDefault();

              handleSubmit(
                e as any
              );

            }

          }}


          placeholder="
          Ask your AI Coach...
          "


          rows={1}


          className="
            flex-1
            resize-none
            rounded-lg
            bg-slate-800
            text-white
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
          "

        />



        <button

          disabled={
            loading
          }

          className="
            bg-blue-600
            hover:bg-blue-700
            disabled:opacity-50
            text-white
            rounded-lg
            px-4
          "

        >

          <Send size={20}/>

        </button>


      </form>


    </div>

  );
}