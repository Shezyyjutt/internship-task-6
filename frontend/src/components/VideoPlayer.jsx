import React from "react";
import { API_SERVER_URL } from "../services/api";

export default function VideoPlayer({ videoUrl }) {
  if (!videoUrl) {
    return (
      <div className="empty-state video-empty">
        <h3>No video available</h3>
        <p>This lesson does not have a video attached yet</p>
      </div>
    );
  }

  const src = videoUrl.startsWith("/uploads")
    ? `${API_SERVER_URL}${videoUrl}`
    : videoUrl;

  return (
    <div className="video-shell">
      <video className="video-player" controls>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
