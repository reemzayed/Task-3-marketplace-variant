import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
//useState: React Hook that lets a component store information that can change over time
//useEffect: React Hook that lets a component perform side effects after rendering such as an api request 
const defaults = { //default values for the form fields
  title: '',
  description: '',
  price: 0,
  category: 'other',
  condition: 'used',
  status: 'active'
}

export default function ListingForm() {
  const nav = useNavigate() //navigate function to redirect the user to a different page after form submission without having to do it manually
  const { id } = useParams()

  const [form, setForm] = useState(defaults) //form state to hold the values of the form fields
  const [error, setError] = useState('') //error state to hold any error messages that may occur during form submission
  const [loading, setLoading] = useState(false) //loading state to indicate whether the form is being submitted

  // Load the existing listing when the page is in edit mode.
  useEffect(() => {
    if (!id) return

    let cancelled = false

    async function loadListing() {
      try {
        setError('')
        const res = await api.get(`/listings/${id}`)
        const listing = res.data.listing

        if (cancelled) return

        setForm({
          title: listing.title ?? '',
          description: listing.description ?? '',
          price: Number(listing.price ?? 0),
          category: listing.category ?? 'other',
          condition: listing.condition ?? 'used',
          status: listing.status === 'sold' ? 'sold' : 'active'
        })
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || 'Could not load this listing.'
          )
        }
      }
    }

    loadListing()

    return () => {
      cancelled = true
    }
  }, [id])

  // Keep the form state synchronized with the inputs.
  function onChange(e) { //onChange event handler for the form inputs
    const { name, value } = e.target

    setForm(current => ({
      ...current,
      [name]: name === 'price' ? (value === '' ? 0 : Number(value)) : value 
    }))
  }

  // Create a new listing or update the existing one.
  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (id) {
        await api.patch(`/listings/${id}`, form)
      } else {
        await api.post('/listings', form)
      }

      nav('/listings')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not save the listing.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'New'} Listing
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Item title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={onChange}
            minLength={2}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-1">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            value={form.price}
            onChange={onChange}
            min="0"
            step="any"
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={onChange}
            className="w-full border rounded p-2"
          >
            <option value="textbooks">Textbooks</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium mb-1">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={form.condition}
            onChange={onChange}
            className="w-full border rounded p-2"
          >
            <option value="new">New</option>
            <option value="like-new">Like New</option>
            <option value="used">Used</option>
            <option value="worn">Worn</option>
          </select>
        </div>

        {id && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full border rounded p-2"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-1"
          >
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
            rows={4}
            className="w-full border rounded p-2"
          />
        </div>

        {error && (
          <div role="alert" className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}