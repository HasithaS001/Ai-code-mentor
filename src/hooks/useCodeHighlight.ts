"use client";

import { useState, useCallback, useRef } from "react";

interface SelectionBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function useCodeHighlight() {
  const [isHighlightActive, setIsHighlightActive] = useState(false);
  const [selectionBounds, setSelectionBounds] = useState<SelectionBounds | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const calculateSelectionBounds = useCallback((editor: any): SelectionBounds | null => {
    if (!editor || !editorContainerRef.current) return null;

    try {
      const selection = editor.getSelection();
      if (!selection || selection.isEmpty()) return null;

      // Get the DOM node for the editor
      const editorDomNode = editor.getDomNode();
      if (!editorDomNode) return null;

      // Get the position of the selection in the editor
      const startPosition = editor.getScrolledVisiblePosition(selection.getStartPosition());
      const endPosition = editor.getScrolledVisiblePosition(selection.getEndPosition());

      if (!startPosition || !endPosition) return null;

      // Get the editor's bounding rectangle
      const editorRect = editorDomNode.getBoundingClientRect();
      const containerRect = editorContainerRef.current.getBoundingClientRect();

      // Calculate the selection bounds relative to the viewport
      const top = editorRect.top + startPosition.top;
      const left = editorRect.left + startPosition.left;
      const width = Math.max(endPosition.left - startPosition.left, 200); // Minimum width
      const height = endPosition.top - startPosition.top + 18; // Line height

      // Ensure the bounds are within reasonable limits
      const bounds: SelectionBounds = {
        top: Math.max(top, containerRect.top),
        left: Math.max(left, containerRect.left),
        width: Math.min(width, containerRect.width - (left - containerRect.left)),
        height: Math.max(height, 18), // Minimum height for single line
      };

      return bounds;
    } catch (error) {
      console.error("Error calculating selection bounds:", error);
      return null;
    }
  }, []);

  const activateHighlight = useCallback((editor: any) => {
    console.log("activateHighlight called with editor:", editor);
    const bounds = calculateSelectionBounds(editor);
    console.log("Calculated bounds:", bounds);
    if (bounds) {
      setSelectionBounds(bounds);
      setIsHighlightActive(true);
      console.log("Highlight activated with bounds:", bounds);
    } else {
      console.log("No bounds calculated, highlight not activated");
    }
  }, [calculateSelectionBounds]);

  const deactivateHighlight = useCallback(() => {
    setIsHighlightActive(false);
    // Keep bounds for smooth exit animation
    setTimeout(() => {
      setSelectionBounds(null);
    }, 500);
  }, []);

  const updateSelectionBounds = useCallback((editor: any) => {
    if (isHighlightActive) {
      const bounds = calculateSelectionBounds(editor);
      if (bounds) {
        setSelectionBounds(bounds);
      }
    }
  }, [isHighlightActive, calculateSelectionBounds]);

  return {
    isHighlightActive,
    selectionBounds,
    editorContainerRef,
    activateHighlight,
    deactivateHighlight,
    updateSelectionBounds,
  };
}
