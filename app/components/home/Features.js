import Tooltip from "../Tooltip"

const features = [
	{
		title: "AI-Powered Analysis",
		desc: "Get fast, accurate scan analysis with confidence scores and clear next steps.",
	},
	{
		title: "Privacy & Security",
		desc: "Your uploads are encrypted, processed securely, and never shared.",
	},
	{
		title: "Personalized Guidance",
		desc: "Receive prevention tips, specialist recommendations, and survivor stories.",
	},
]

export default function Features() {
	return (
		<section
			className="w-full py-12 px-4 bg-black text-cyan-100"
			style={{ background: "#000" }}
		>
			<div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
				{features.map((f) => (
					<div
						key={f.title}
						className="rounded-2xl shadow-2xl p-6 border bg-[#18181b]/90 border-cyan-800 text-cyan-100 backdrop-blur-md"
					>
						<div className="flex items-center gap-2 mb-2">
							<span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
							<h3 className="text-lg font-bold text-cyan-300 drop-shadow-lg">
								{f.title}
							</h3>
							<Tooltip text={f.desc}>
								<svg
									className="w-4 h-4 text-cyan-400 ml-1 cursor-pointer"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									viewBox="0 0 20 20"
								>
									<circle cx="10" cy="10" r="9" />
									<path d="M10 7v3m0 4h.01" />
								</svg>
							</Tooltip>
						</div>
						<p className="text-cyan-100/90">{f.desc}</p>
					</div>
				))}
			</div>
			<div className="mt-8 flex justify-center">
				<Tooltip text="Features are for demonstration. For real medical advice, consult a professional.">
					<span className="text-xs text-cyan-400 underline cursor-pointer">
						Learn more about these features
					</span>
				</Tooltip>
			</div>
		</section>
	)
}
