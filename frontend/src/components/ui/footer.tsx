export default function Footer(){
  return (
    <footer className="border-t mt-10">
      <div className="mx-auto max-w-7xl p-6 text-sm text-gray-500 flex justify-between">
        <div>© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME}</div>
        <div>Contact: {process.env.NEXT_PUBLIC_CONTACT_EMAIL}</div>
      </div>
    </footer>
  )
}