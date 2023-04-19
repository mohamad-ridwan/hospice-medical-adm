import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <link rel="stylesheet" href="https://use.fontawesome.com/releases/v6.1.2/css/all.css" />
                <link rel="stylesheet" href="font-awesome/css/font-awesome.min.css" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}