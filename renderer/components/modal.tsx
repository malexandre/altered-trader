import { Fragment } from 'react'

export default function Modal({ children, onClose }) {
  return (
    <Fragment>
      <div
        className="fixed inset-0 flex items-center justify-center w-full max-h-full bg-black bg-opacity-50 z-50"
        onClick={onClose}
      >
        <div
          className="relative bg-white p-4 rounded-lg w-4/5 h-4/5 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" onClick={onClose}>
            &#10005;
          </button>
          {children}
        </div>
      </div>
    </Fragment>
  )
}
