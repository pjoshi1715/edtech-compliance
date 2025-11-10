import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            const childElement = child as React.ReactElement<any>
            return React.cloneElement(childElement, {
              checked: (childElement.props as any).value === value,
              onSelect: onValueChange,
            })
          }
          return child
        })}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onSelect'> {
  value: string
  onSelect?: (value: string) => void
  label?: string
  description?: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, onSelect, label, description, checked, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer transition-colors",
          checked
            ? "border-primary bg-primary/5"
            : "border-input hover:border-primary/50",
          className
        )}
        onClick={() => onSelect?.(value)}
      >
        <input
          ref={ref}
          type="radio"
          className="mt-0.5 h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
          value={value}
          checked={checked}
          onChange={(e) => {
            if (e.target.checked) {
              onSelect?.(value)
            }
          }}
          {...props}
        />
        <div className="flex-1">
          {label && (
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
