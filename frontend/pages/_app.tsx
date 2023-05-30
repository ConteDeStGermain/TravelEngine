import '../styles/globals.css'  // adjust this path according to your directory structure
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  // @ts-ignore
  return <Component {...pageProps} />
}

export default MyApp