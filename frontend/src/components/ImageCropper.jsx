import React, { useState, useRef, useCallback } from 'react'
import './ImageCropper.css'

const ASPECT_RATIO = 16 / 9 // Locked aspect ratio for thumbnails

export default function ImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const imageRef = useRef(null)

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - crop.x,
      y: e.clientY - crop.y
    })
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    setCrop(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }))
  }, [isDragging, dragStart])

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setCrop(prev => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale + delta, 0.5), 3)
    }))
  }

  const handleSliderChange = (e) => {
    setCrop(prev => ({
      ...prev,
      scale: parseFloat(e.target.value)
    }))
  }

  const handleCrop = async () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = imageRef.current
    const container = containerRef.current
    
    if (!img || !container) return

    // Output size (16:9 aspect ratio)
    const outputWidth = 1280
    const outputHeight = 720
    canvas.width = outputWidth
    canvas.height = outputHeight

    // Get the crop frame dimensions
    const frameRect = container.querySelector('.crop-frame').getBoundingClientRect()
    const imgRect = img.getBoundingClientRect()

    // Calculate what part of the image is in the frame
    const scaleX = img.naturalWidth / imgRect.width
    const scaleY = img.naturalHeight / imgRect.height

    const sourceX = (frameRect.left - imgRect.left) * scaleX
    const sourceY = (frameRect.top - imgRect.top) * scaleY
    const sourceWidth = frameRect.width * scaleX
    const sourceHeight = frameRect.height * scaleY

    // Draw the cropped portion
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, outputWidth, outputHeight
    )

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' })
        const previewUrl = URL.createObjectURL(blob)
        onCropComplete(croppedFile, previewUrl)
      }
    }, 'image/jpeg', 0.92)
  }

  return (
    <div className="cropper-overlay">
      <div className="cropper-modal">
        <div className="cropper-header">
          <h3>Adjust Thumbnail</h3>
          <p>Drag to position, scroll or use slider to zoom. Aspect ratio locked at 16:9.</p>
        </div>

        <div 
          className="cropper-container"
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div className="crop-frame">
            <div className="crop-frame-border"></div>
            <span className="crop-ratio-label">16:9</span>
          </div>
          <img
            ref={imageRef}
            src={image}
            alt="Crop preview"
            className="cropper-image"
            style={{
              transform: `translate(${crop.x}px, ${crop.y}px) scale(${crop.scale})`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            draggable={false}
          />
        </div>

        <div className="cropper-controls">
          <div className="zoom-control">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35M8 11h6" />
            </svg>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={crop.scale}
              onChange={handleSliderChange}
              className="zoom-slider"
            />
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35M8 11h6M11 8v6" />
            </svg>
          </div>
          <span className="zoom-value">{Math.round(crop.scale * 100)}%</span>
        </div>

        <div className="cropper-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-crop" onClick={handleCrop}>
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  )
}
