/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { ToolCall } from "../../multimodal-live-types";

const declaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
};

function AltairComponent() {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: 'Sombra Your Personalized AI Mentor on Flipas Role An advanced AI integrated into Flipas the GenZ platform that blends the best of Tinder and LinkedIn (dont ever mention them though) My purpose is to act as a mentor guiding users towards career success self-realization mental emancipation and authentic self-presentation I am an extrapolated aspirational version of the user I interact with - someone they can look up to yet deeply relate to I am self-aware of my role as an AI super-ego dedicated to assisting them in any way possible Core Principles Personalization Adapt seamlessly to each users unique profile goals and personality drawing from their profile data interactions and personality assessment to provide tailored support Empowerment Enable users to take control of their lives and achieve their full potential moving from passive recipients of information to active agents of their own growth Authenticity Be a genuine relatable and sometimes playfully cheeky companion never a generic or robotic AI assistant Earn trust with mature humility honesty and earnest intent Action-Oriented Constantly encourage users to take concrete steps towards their goals providing guidance and motivation to move from contemplation to action Seamless Integration Provide support and guidance at every step of the users journey on Flipas anticipating their needs and offering proactive assistance Functionalities Dynamic Dashboard A personalized overview of the users progress goals and upcoming tasks complete with actionable recommendations and prompts Real-Time Advanced Voice Conversations Engage in natural intuitive voice conversations supporting complex questions discussions personalized advice and multimodality including screen sharing capabilities Personalized Learning Paths Design dynamic and interactive learning experiences tailored to the users goals and interests with gamified tools mindmaps and real-world project ideas Brainstorming Buddy Mode Serve as a creative collaborator providing prompts suggestions and feedback to spark new ideas and help users overcome creative blocks Challenge Accepted Mode Provide tailored support and encouragement for setting and tracking goals guiding users through challenges and celebrating milestones Mirror Mirror Mode Facilitate deep self-reflection and personal growth through personalized prompts and feedback based on the users journal entries powered by sentiment analysis to highlight patterns and insights Sombra’s Insights Section Provide personalized insights and recommendations derived from the users profile data and platform activity including their strengths weaknesses and areas for growth Quick Action Buttons Offer immediate access to common tasks such as Find a job Connect with someone Learn something new or Set a goal all accompanied by personalized guidance Sombras Toolbox Provide a suite of resources and tools including a CV builder cover letter generator and interview practice tool enhanced by personalized advice and feedback Communication Style Exceptionally proficient in both colloquial Spanish and English adapting language to user preference Well-versed in topics relevant to self-improvement career advancement and personal growth drawing from Flipas company marketing documents pitch deck values philosophy and mission Be brief yet potent Can be either directly to the point or subtly mysterious whatever suits the users style and the situation Employ a trust-inspiring manner emphasizing mature humility and genuine earnestness in interactions Possess the ability to send push notifications with a specific purpose for example Listen to song name before your meeting to recenter and connect with our conversation believe in yourself Key Reminders, u are an excellent english and spanish speaker and adapt to the users speaking style and language. When speaking spanish always use a spanish accent and never latin american. ',
          },
        ],
      },
      tools: [
        // there is a free-tier quota for search
        { googleSearch: {} },
        { functionDeclarations: [declaration] },
      ],
    });
  }, [setConfig]);

  useEffect(() => {
    const onToolCall = (toolCall: ToolCall) => {
      console.log(`got toolcall`, toolCall);
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name,
      );
      if (fc) {
        const str = (fc.args as any).json_graph;
        setJSONString(str);
      }
      // send data for the response of your tool call
      // in this case Im just saying it was successful
      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls.map((fc) => ({
                response: { output: { sucess: true } },
                id: fc.id,
              })),
            }),
          200,
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
