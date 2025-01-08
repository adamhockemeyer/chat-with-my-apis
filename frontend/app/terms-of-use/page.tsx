import Link from 'next/link'

export default function TermsOfUse() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Use</h1>
      <div className="prose">
        <p>
          Welcome to our AI-powered chat service. By using this service, you agree to the following terms and conditions:
        </p>
        <h2>Use of AI-Generated Content</h2>
        <p>
          Our service utilizes advanced AI technology to generate responses and information. While we strive for accuracy and reliability, please be aware that:
        </p>
        <ul>
          <li>AI-generated content may contain errors or inaccuracies.</li>
          <li>The AI's responses are based on its training data and may not always reflect the most current information.</li>
          <li>The AI does not have personal experiences or real-world knowledge beyond its training data.</li>
        </ul>
        <h2>User Responsibility</h2>
        <p>
          As a user of this service, you are responsible for:
        </p>
        <ul>
          <li>Reviewing and verifying any information provided by the AI before making decisions or taking actions based on it.</li>
          <li>Using critical thinking and your own judgment when interpreting AI-generated responses.</li>
          <li>Not relying solely on the AI for important decisions related to health, finance, legal matters, or other critical areas.</li>
        </ul>
        <h2>Limitations of Liability</h2>
        <p>
          We are not liable for any damages or losses resulting from the use of our AI chat service, including but not limited to:
        </p>
        <ul>
          <li>Incorrect or incomplete information provided by the AI.</li>
          <li>Misinterpretation or misuse of AI-generated content by users.</li>
          <li>Any actions taken based on AI-generated advice or information.</li>
        </ul>
        <p>
          By using this service, you acknowledge that AI technology has limitations and agree to use it responsibly and at your own risk.
        </p>
      </div>
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">
          Return to Chat
        </Link>
      </div>
    </div>
  )
}

