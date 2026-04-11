/**
 * Video Generator Types
 */

export interface ViralScript {
  hook: string;
  body: string;
  cta: string;
  tema: string;
}

export interface VideoRequest {
  imageUrl?: string;
  prompt?: string;
  duration?: number;
}

export interface VideoResponse {
  id: string;
  status: 'queued' | 'processing' | 'complete' | 'error';
  videoUrl?: string;
  error?: string;
}

export class VideoGenerator {
  async generate(request: VideoRequest): Promise<VideoResponse> {
    return {
      id: 'placeholder',
      status: 'complete',
      videoUrl: request.imageUrl
    };
  }
}