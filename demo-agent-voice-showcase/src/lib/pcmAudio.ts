import { base64ToPCMFloat32, floatTo16BitPCM, arrayBufferToBase64, downsampleTo16k } from './audioUtils';

export class LiveAudioEngine {
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private outputAnalyserNode: AnalyserNode | null = null;
  private scheduledSources: AudioBufferSourceNode[] = [];
  private nextPlayTime = 0;
  private isMuted = false;
  private onAudioDataCallback: ((base64Pcm: string) => void) | null = null;
  private onVolumeCallback: ((volume: number) => void) | null = null;
  private preObtainedStream: MediaStream | null = null;

  setMicStream(stream: MediaStream) {
    this.preObtainedStream = stream;
  }

  async initInput() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.inputAudioCtx = new AudioContextClass();
    if (this.inputAudioCtx.state === 'suspended') {
      await this.inputAudioCtx.resume();
    }
  }

  async startInput(
    onAudioChunk: (base64Pcm: string) => void,
    onVolumeChange?: (volume: number) => void,
    prebuiltCtx?: AudioContext,
    prebuiltStream?: MediaStream
  ): Promise<void> {
    this.onAudioDataCallback = onAudioChunk;
    this.onVolumeCallback = onVolumeChange || null;

    // ponytail: usar AudioContext y stream pre-creados si existen
    if (prebuiltCtx) {
      this.inputAudioCtx = prebuiltCtx;
    } else if (!this.inputAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioContextClass();
    }
    if (this.inputAudioCtx.state === 'suspended') {
      await this.inputAudioCtx.resume();
    }

    if (prebuiltStream) {
      this.mediaStream = prebuiltStream;
    } else if (this.preObtainedStream) {
      this.mediaStream = this.preObtainedStream;
      this.preObtainedStream = null;
    } else {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
    }

    const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);

    // ponytail: ScriptProcessorNode directo. El warning de deprecacion es solo un aviso.
    const scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);
    scriptProcessor.onaudioprocess = (ev) => {
      if (this.isMuted) return;
      const rawInput = ev.inputBuffer.getChannelData(0);
      if (this.onVolumeCallback) {
        let sum = 0;
        for (let i = 0; i < rawInput.length; i++) sum += rawInput[i] * rawInput[i];
        const rms = Math.sqrt(sum / rawInput.length);
        this.onVolumeCallback(Math.min(100, Math.round(rms * 250)));
      }
      const inputData = downsampleTo16k(rawInput, this.inputAudioCtx ? this.inputAudioCtx.sampleRate : 48000);
      const pcm16Buffer = floatTo16BitPCM(inputData);
      const base64 = arrayBufferToBase64(pcm16Buffer);
      if (this.onAudioDataCallback) this.onAudioDataCallback(base64);
    };
    source.connect(scriptProcessor);
    scriptProcessor.connect(this.inputAudioCtx.destination);
  }

  setMuted(muted: boolean) { this.isMuted = muted; }

  async initPlayback() {
    if (!this.outputAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.outputAudioCtx = new AudioContextClass();
      this.nextPlayTime = this.outputAudioCtx.currentTime;
      this.outputAnalyserNode = this.outputAudioCtx.createAnalyser();
      this.outputAnalyserNode.fftSize = 128;
      this.outputAnalyserNode.connect(this.outputAudioCtx.destination);
    }
    if (this.outputAudioCtx.state === 'suspended') {
      await this.outputAudioCtx.resume();
    }
  }

  getOutputAnalyser(): AnalyserNode | null { return this.outputAnalyserNode; }

  flushPlayback() {
    for (const source of this.scheduledSources) {
      try { source.stop(); source.disconnect(); } catch {}
    }
    this.scheduledSources = [];
    if (this.outputAudioCtx) this.nextPlayTime = this.outputAudioCtx.currentTime;
  }

  async playAudioChunk(base64Pcm: string, sampleRate = 24000) {
    await this.initPlayback();
    if (!this.outputAudioCtx || !this.outputAnalyserNode) return;
    try {
      const float32Samples = base64ToPCMFloat32(base64Pcm);
      if (float32Samples.length === 0) return;
      const buffer = this.outputAudioCtx.createBuffer(1, float32Samples.length, sampleRate);
      buffer.getChannelData(0).set(float32Samples);
      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = buffer;
      source.onended = () => { this.scheduledSources = this.scheduledSources.filter((s) => s !== source); };
      source.connect(this.outputAnalyserNode);
      this.scheduledSources.push(source);
      const currentTime = this.outputAudioCtx.currentTime;
      if (this.nextPlayTime < currentTime) this.nextPlayTime = currentTime;
      source.start(this.nextPlayTime);
      this.nextPlayTime += buffer.duration;
    } catch (e) { console.error('Error playing live PCM audio chunk:', e); }
  }

  stop() {
    this.isMuted = true;
    this.flushPlayback();
    if (this.workletNode) { try { this.workletNode.disconnect(); } catch {} this.workletNode = null; }
    if (this.mediaStream) { try { this.mediaStream.getTracks().forEach((track) => track.stop()); } catch {} this.mediaStream = null; }
    if (this.inputAudioCtx) { try { this.inputAudioCtx.close(); } catch {} this.inputAudioCtx = null; }
    if (this.outputAudioCtx) { try { this.outputAudioCtx.close(); } catch {} this.outputAudioCtx = null; }
    this.outputAnalyserNode = null;
    this.nextPlayTime = 0;
  }
}
