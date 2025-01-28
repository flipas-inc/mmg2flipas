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

import { useRef, useState } from 'react'
import './App.scss'
import { LiveAPIProvider } from './contexts/LiveAPIContext'
import SidePanel from './components/side-panel/SidePanel'
import { Altair } from './components/altair/Altair'
import ControlTray from './components/control-tray/ControlTray'
import cn from 'classnames'
import { Button, Container, Stack, Switch } from '@mui/material'

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string
if (typeof API_KEY !== 'string') {
  throw new Error('set REACT_APP_GEMINI_APIK_KEY in .env')
}

const host = 'generativelanguage.googleapis.com'
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`

function App() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null)
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [isShapeDefault, setIsShapeDefault] = useState(true)
  const [isStyleFlipas, setIsStyleFlipas] = useState(true)
  const [text, setText] = useState('AI')

  const stylesColor = isStyleFlipas
    ? {
        color: 'rgba(255,255,255,0.7)',
        backgroundColor: 'rgba(215, 232, 0, 1)',
        '&:hover': {
          backgroundColor: 'rgba(225, 225, 0, 1)',
        },
      }
    : {
        color: 'rgba(194,136,116,1)',
        backgroundColor: 'rgba(255,255,255,1)',
        '&:hover': {
          backgroundColor: 'rgba(235,235,235,1)',
        },
      }

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
          <SidePanel />
          <main>
            <Container
              disableGutters
              sx={{ width: '100%', height: '100%', backgroundColor: 'green' }}
            >
              <div className="main-app-area">
                {/* APP goes here */}
                <Altair />
                <video
                  className={cn('stream', {
                    hidden: !videoRef.current || !videoStream,
                  })}
                  ref={videoRef}
                  autoPlay
                  playsInline
                />
              </div>

              <Stack
                sx={{
                  height: '100%',
                  width: '100%',
                  justifyContent: 'end',
                  alignItems: 'center',
                  flexDirection: 'column',
                  backgroundColor: isStyleFlipas
                    ? 'rgba(0,0,0,1)'
                    : 'rgba(186,20,37,1)',
                }}
              >
                {/* </ControlTray> */}

                <Stack
                  sx={{
                    backgroundColor: 'gray',
                    borderRadius: 10,
                    padding: 1,
                    margin: 2,
                    flexDirection: 'row',
                  }}
                >
                  <Switch
                    onClick={() => {
                      setIsShapeDefault(!isShapeDefault)
                    }}
                    color="default"
                  />
                  <Switch
                    onClick={() => {
                      setIsStyleFlipas(!isStyleFlipas)
                    }}
                    color="default"
                  />
                </Stack>

                <ControlTray
                  videoRef={videoRef}
                  supportsVideo={true}
                  onVideoStreamChange={setVideoStream}
                  styles={stylesColor}
                  isShapeDefault={isShapeDefault}
                  isStyleFlipas={isStyleFlipas}
                />
              </Stack>
            </Container>
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  )
}

export default App
