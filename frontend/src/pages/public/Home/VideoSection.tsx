import { motion } from "motion/react";

export default function VideoSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source
          src="https://www.w3schools.com/html/mov_bbb.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content on top of video */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Discover StyleHub
          </h2>
          <p className="text-lg md:text-xl mb-6 text-white/90">
            Learn about our platform, AI-powered recommendations, and how we
            connect you with the best fashion brands
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-2xl font-semibold mb-3">
              The Future of Fashion is Here
            </h3>
            <p className="text-white/80 leading-relaxed">
              StyleHub combines cutting-edge AI technology with curated fashion
              collections to bring you a personalized shopping experience like
              no other. From independent designers to global brands, discover
              fashion that matches your unique style.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
