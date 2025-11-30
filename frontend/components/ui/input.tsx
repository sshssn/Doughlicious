"use client"
import { InputHTMLAttributes, forwardRef } from "react"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const { className, ...rest } = props
    return <input ref={ref} className={`border rounded-md p-2 w-full ${className ?? ""}`} {...rest} />
  }
)

Input.displayName = "Input"