"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useSwipeGesture } from "@/lib/hooks/useSwipeGesture"
import { useHapticFeedback } from "@/lib/hooks/useHapticFeedback"
import FocusLock from "react-focus-lock"

export interface MobileMenuProps {
  /**
   * Whether the mobile menu is open
   */
  open?: boolean

  /**
   * Callback fired when the menu open state changes
   */
  onOpenChange?: (open: boolean) => void

  /**
   * The trigger element that opens the menu
   */
  trigger: React.ReactNode

  /**
   * The content of the mobile menu
   */
  children: React.ReactNode

  /**
   * Optional title for the menu header
   */
  title?: string

  /**
   * Additional CSS classes for the menu content
   */
  className?: string

  /**
   * Test ID for testing purposes
   */
  "data-testid"?: string
}

export function MobileMenu({
  open,
  onOpenChange,
  trigger,
  children,
  title = "Menu",
  className,
  "data-testid": testId = "mobile-menu",
}: MobileMenuProps) {
  const haptic = useHapticFeedback({
    config: {
      lightDuration: 10,
      mediumDuration: 20,
      enabled: true,
    },
  })

  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const firstFocusableRef = React.useRef<HTMLButtonElement>(null)

  // Add swipe gesture support for opening/closing from screen edges
  const { gestureState, gestureHandlers } = useSwipeGesture({
    config: {
      threshold: 80, // Lower threshold for edge swipe
      velocityThreshold: 0.3,
      preventDefault: false, // Allow normal touch behaviors
    },
    handlers: {
      onSwipeComplete: (state) => {
        // Swipe from left edge to open menu
        if (state.direction === "right" && !open && state.offset > 50) {
          onOpenChange?.(true)
          haptic.light() // Haptic feedback for menu open
        }
        // Swipe from right to left to close menu (when open)
        else if (state.direction === "left" && open && state.offset < -50) {
          onOpenChange?.(false)
          haptic.light() // Haptic feedback for menu close
        }
      },
    },
  })

  // Handle menu state changes for haptic feedback and focus management
  React.useEffect(() => {
    if (open) {
      haptic.light() // Haptic feedback when menu opens

      // Set initial focus to first navigation item after a brief delay
      setTimeout(() => {
        firstFocusableRef.current?.focus()
      }, 100)
    } else {
      // Restore focus to trigger element when menu closes
      triggerRef.current?.focus()
    }
  }, [open, haptic])

  // Keyboard event handlers
  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    if (!open) return

    switch (event.key) {
      case "Escape":
        event.preventDefault()
        onOpenChange?.(false)
        haptic.light() // Haptic feedback for menu close
        break
      default:
        break
    }
  }, [open, onOpenChange, haptic])

  // Add keyboard event listener
  React.useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, handleKeyDown])

  return (
    <>
      {/* Edge swipe area for opening menu */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-6 z-40 transition-opacity",
          !open && "hover:bg-foreground/5 active:bg-foreground/10"
        )}
        {...gestureHandlers}
        data-testid={`${testId}-edge-swipe-area`}
        style={{
          opacity: open ? 0 : gestureState.isDragging ? 0.5 : 0.3,
        }}
      />

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger
          asChild
          data-testid={`${testId}-trigger`}
          ref={triggerRef}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-label={`${title} navigation`}
        >
          {trigger}
        </SheetTrigger>
        <SheetContent
          side="left"
          className={cn("w-80 sm:w-96", className)}
          data-testid={`${testId}-content`}
          style={{
            transform: open && gestureState.isDragging ? `translateX(${gestureState.offset}px)` : undefined,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${testId}-title`}
          aria-label={`${title} navigation`}
        >
          <FocusLock disabled={!open} returnFocus>
            <div
              {...gestureHandlers}
              className="h-full w-full"
              data-testid={`${testId}-swipe-area`}
            >
              <SheetHeader className="text-left">
                <SheetTitle
                  className="text-foreground"
                  data-testid={`${testId}-title`}
                  id={`${testId}-title`}
                >
                  {title}
                </SheetTitle>
              </SheetHeader>
              <nav
                className="mt-6"
                data-testid={`${testId}-body`}
                role="navigation"
                aria-label={`${title} navigation`}
              >
                {React.Children.map(children, (child, index) => {
                  if (React.isValidElement(child) && child.type === MobileMenuItem) {
                    return React.cloneElement(child, {
                      ref: index === 0 ? firstFocusableRef : undefined,
                      ...child.props,
                    })
                  }
                  return child
                })}
              </nav>
            </div>
          </FocusLock>
        </SheetContent>
      </Sheet>
    </>
  )
}

export interface MobileMenuItemProps {
  /**
   * The content of the menu item (icon and label)
   */
  children: React.ReactNode

  /**
   * Callback fired when the item is clicked
   */
  onClick?: () => void

  /**
   * Whether the item is disabled
   */
  disabled?: boolean

  /**
   * Whether the item is currently active/selected
   */
  active?: boolean

  /**
   * Optional badge/counter to display
   */
  badge?: string | number

  /**
   * Icon to display before the label
   */
  icon?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for testing purposes
   */
  "data-testid"?: string
}

export function MobileMenuItem({
  children,
  onClick,
  disabled = false,
  active = false,
  badge,
  icon,
  className,
  "data-testid": testId = "mobile-menu-item",
}: MobileMenuItemProps) {
  const [isPressed, setIsPressed] = React.useState(false)
  const haptic = useHapticFeedback({
    config: {
      mediumDuration: 20,
      enabled: true,
    },
  })

  const handleTouchStart = React.useCallback(() => {
    if (!disabled) {
      setIsPressed(true)
    }
  }, [disabled])

  const handleTouchEnd = React.useCallback(() => {
    setIsPressed(false)
  }, [])

  const handleClick = React.useCallback(() => {
    if (!disabled && onClick) {
      haptic.medium() // Haptic feedback for item selection
      onClick()
    }
  }, [disabled, onClick, haptic])

  return (
    <SheetClose asChild>
      <Button
        variant="ghost"
        size="medium"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        disabled={disabled}
        className={cn(
          "w-full justify-start min-h-[48px] px-4 text-left font-normal relative",
          "text-foreground hover:bg-foreground/5 hover:text-foreground",
          "active:bg-foreground/10 active:scale-[0.98]",
          "focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2",
          active && "bg-foreground/10 text-foreground font-medium",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        data-testid={testId}
        data-touch-context="navigation"
        style={{
          transform: isPressed ? 'scale(0.98)' : undefined,
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Ripple effect */}
        {isPressed && !disabled && (
          <div
            className="absolute inset-0 bg-foreground/5 rounded-lg animate-pulse"
            data-testid={`${testId}-ripple`}
          />
        )}

        <div className="flex items-center gap-3 w-full min-h-[48px]">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              {icon}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Badge */}
          {badge && (
            <div
              className={cn(
                "flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full",
                "bg-primary text-primary-foreground",
                "min-w-[20px] h-5 flex items-center justify-center"
              )}
              data-testid={`${testId}-badge`}
            >
              {badge}
            </div>
          )}
        </div>
      </Button>
    </SheetClose>
  )
}
