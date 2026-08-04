/**
 * Converts raw PCM 16-bit LE buffer to a standard WAV Buffer with RIFF header
 * so HTML5 Audio elements and browser media APIs can play it directly.
 */
export function pcmToWavBuffer(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1): Buffer {
  const wavHeader = Buffer.alloc(44);
  const dataSize = pcmBuffer.length;
  const fileSize = 36 + dataSize;
  const byteRate = sampleRate * numChannels * 2;

  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(fileSize, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16); // Subchunk1Size
  wavHeader.writeUInt16LE(1, 20);  // PCM format
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(numChannels * 2, 32);
  wavHeader.writeUInt16LE(16, 34); // 16 bits per sample
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(dataSize, 40);

  return Buffer.concat([wavHeader, pcmBuffer]);
}

/**
 * Downsamples Float32Array audio data from source sampleRate down to 16000Hz for Gemini Live input
 */
export function downsampleTo16k(input: Float32Array, sampleRate: number): Float32Array {
  if (sampleRate === 16000) return input;
  const compression = sampleRate / 16000;
  const length = Math.floor(input.length / compression);
  const result = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const index = Math.floor(i * compression);
    result[i] = input[index];
  }
  return result;
}

/**
 * Encodes Float32Array audio data from AudioContext to 16-bit PCM ArrayBuffer
 */
export function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return output.buffer;
}

/**
 * Converts ArrayBuffer to Base64 string safely
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes Base64 string to Float32Array PCM audio buffer (24kHz default for Gemini Live output)
 */
export function base64ToPCMFloat32(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const dataView = new DataView(bytes.buffer);
  const samples = new Float32Array(len / 2);
  for (let i = 0; i < samples.length; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    samples[i] = int16 / (int16 < 0 ? 32768 : 32767);
  }
  return samples;
}
