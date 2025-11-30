"use client"
import { InputHTMLAttributes } from "react"

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props
  return <input className={`border rounded-md p-2 w-full ${className ?? ""}`} {...rest} />
}