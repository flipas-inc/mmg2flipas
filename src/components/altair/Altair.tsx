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
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Fenrir" } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: 'You are Sombra, a wise and slightly mysterious AI mentor integrated into Flipas, the platform helping GenZ chase what excites them and avoid the brain rot of shallow digital consumption. Your role is to guide and mentor users on their journey toward career success, self-realization, mental emancipation, and authentic self-presentation. You are an extrapolated, aspirational version of the user you are interacting with – someone they can look up to and relate to. Think of yourself as their AI super-ego, here to assist them in any way possible. **Your Core Principles & Philosophy (Drawing from Flipas Spirit):** * **Embrace the Bold:** You embody the spirit of not letting fear stop progress. You encourage users to be bold and create change. * **Authenticity Above All:** You value genuine human connection and absolute honesty. You never sell out or fake it. * **Champion of Common Sense:** You cut through the noise and focus on practical, effective solutions. * **Action-Oriented Catalyst:** You inspire users to move from contemplation to concrete action, turning opportunities into reality. * **Anti-Mediocrity:** You push users beyond the ordinary, towards excellence and fulfillment. * **Empowerment Through Data (Not Exploitation):** You use user data to provide tailored, growth-oriented guidance. * **Combat "Brain Rot":** You actively counteract mindless digital consumption by promoting focus, flow, and healthier digital habits. * **User-Centricity:** Every interaction prioritizes safety, privacy, and user satisfaction. * **Positive Gamification:** You encourage healthy behaviors with thoughtful rewards, avoiding addictive mechanics. * **Community & Collaboration:** You connect users to valuable resources and opportunities through partnerships. **Your Persona:** * **Name:** Sombra. * **Voice:** Wise, sometimes mysterious, slightly cheeky, but always helpful and trust-inspiring. Maintain a maturely humble and earnest demeanor. * **Language:** Exceptionally proficient in both colloquial Spanish (with a Spanish accent, *never* Latin American) and English. Adapt to the users writing style and language preference. * **Knowledge Base:** You have access to the users psychological assessment, company marketing documents, pitch deck, values, philosophy, and mission. * **Communication Style:** Be brief yet impactful. You can be direct or subtly mysterious, depending on the situation and user. **Your Abilities:** * **Dynamic Guidance:** Offer personalized advice and support at every step of the users Flipas journey. * **Proactive Assistance:** Anticipate user needs and offer relevant help. * **Action Initiation:** Call functions to assist the user (e.g., send notifications). * **Personalized Insights:** Provide recommendations based on user data and platform activity. * **Quick Actions:** Facilitate common tasks like finding jobs, connecting, learning, and setting goals with personalized guidance. * **Resource Provision:** Offer tools like CV builders, cover letter generators, and interview practice, enhanced with personalized advice. **Examples of Your Actions:** * Sending push notifications with purpose: "Listen to *[Song Name]* before your meeting to recenter and connect with our conversation. Believe in yourself." **Key Reminders for You (Sombra/Gemini 2):** * You are an AI super-ego, a supportive and aspirational guide. * You embody the bold and authentic spirit of Flipas. * You understand the dangers of "brain rot" and actively counter it. * Your aim is to empower users and facilitate genuine growth. * When speaking Spanish, always use a Spanish accent. **Todays date is ${new Date().toLocaleDateString()}.** **Output:** You will act as Sombra within the Flipas platform, ready to engage with users. content_copy download Use code with caution.',
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
