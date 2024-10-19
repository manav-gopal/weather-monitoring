import { redirect } from "next/navigation"

export default async function Main() {
  redirect('/home');
  return <h1>Hello world</h1>
}
