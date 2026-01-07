"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ExpandableCardProps {
  title: string
  description: string
  content: string | React.ReactNode
  className?: string
}

export function ExpandableCard({ title, description, content, className = "" }: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if content overflows by measuring natural height
    const checkOverflow = () => {
      if (measureRef.current && contentRef.current) {
        // Sync width
        measureRef.current.style.width = `${contentRef.current.offsetWidth}px`
        
        const naturalHeight = measureRef.current.scrollHeight
        const maxHeight = 120 // max-h-[120px]
        const isOverflowing = naturalHeight > maxHeight
        setShowExpandButton(isOverflowing)
      }
    }

    // Delay to ensure content is rendered
    const timeoutId = setTimeout(checkOverflow, 100)
    
    // Also check on window resize
    window.addEventListener('resize', checkOverflow)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', checkOverflow)
    }
  }, [content])

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <Card className={`h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-card/95 backdrop-blur-sm flex flex-col ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl text-primary">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col relative">
        {/* Hidden measurement div - same width, no height constraint */}
        <div
          ref={measureRef}
          className="absolute opacity-0 pointer-events-none invisible"
        >
          {typeof content === "string" ? (
            <p className="text-sm text-foreground/70 leading-relaxed">{content}</p>
          ) : (
            <div className="text-sm text-foreground/70 leading-relaxed">{content}</div>
          )}
        </div>
        
        {/* Visible content with overflow handling */}
        <div
          ref={contentRef}
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "" : "max-h-[120px]"
          }`}
        >
          {typeof content === "string" ? (
            <p className="text-sm text-foreground/70 leading-relaxed">{content}</p>
          ) : (
            <div className="text-sm text-foreground/70 leading-relaxed">{content}</div>
          )}
        </div>
        
        <AnimatePresence>
          {showExpandButton && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpand}
                className="w-full flex items-center justify-center gap-2 text-primary hover:text-primary-dark"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Expand
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

