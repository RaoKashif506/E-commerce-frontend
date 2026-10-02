import { useState } from 'react'
import type { FormEvent } from 'react'
import { TextField } from '../components/TextField.tsx'
import { usePageTitle } from '../lib/usePageTitle.ts'
import { validateMessage } from '../lib/validate.ts'
import type { MessageErrors } from '../lib/validate.ts'

export function ContactPage() {
  usePageTitle('Contact · Marlow')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<MessageErrors>({})
  const [sent, setSent] = useState(false)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const next = validateMessage({ name, email, message })
    setErrors(next)
    if (Object.keys(next).length > 0) {
      const first = (['name', 'email', 'message'] as const).find((field) => next[field])
      if (first) document.getElementById(first)?.focus()
      return
    }
    setSent(true)
  }

  return (
    <div className="wrap page prose">
      <h1>Contact</h1>
      <p>Send a note about an order, a return, or something you could not find.</p>
      {sent ? (
        <div className="status-block" role="status">
          <h2>Message received.</h2>
          <p>It stays on this device. Nothing is sent to a server.</p>
        </div>
      ) : (
        <form className="contact-form" onSubmit={onSubmit} noValidate>
          {Object.keys(errors).length > 0 ? (
            <p className="form-alert" role="alert">
              Check the highlighted fields.
            </p>
          ) : null}
          <TextField id="name" label="Name" autoComplete="name" value={name} error={errors.name} onChange={setName} />
          <TextField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            error={errors.email}
            onChange={setEmail}
          />
          <TextField
            id="message"
            label="Message"
            multiline
            value={message}
            error={errors.message}
            onChange={setMessage}
          />
          <button type="submit" className="button-primary">
            Send message
          </button>
        </form>
      )}
    </div>
  )
}
