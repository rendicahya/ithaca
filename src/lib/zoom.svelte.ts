const MIN_ZOOM = 0.5
const MAX_ZOOM = 2
const ZOOM_STEP = 0.25

/**
 * Per-instance zoom level for canvases that aren't backed by Svelte Flow
 * (which has its own pan/zoom). Uses the CSS `zoom` property rather than a
 * `transform: scale`, so percentage-based layout inside the canvas reflows
 * correctly instead of clipping or leaving dead space.
 */
export class ZoomState {
  level = $state(1)

  get canZoomIn(): boolean {
    return this.level < MAX_ZOOM
  }

  get canZoomOut(): boolean {
    return this.level > MIN_ZOOM
  }

  zoomIn = (): void => {
    this.level = Math.min(MAX_ZOOM, Math.round((this.level + ZOOM_STEP) * 100) / 100)
  }

  zoomOut = (): void => {
    this.level = Math.max(MIN_ZOOM, Math.round((this.level - ZOOM_STEP) * 100) / 100)
  }

  reset = (): void => {
    this.level = 1
  }
}
