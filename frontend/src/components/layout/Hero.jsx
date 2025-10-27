import { Link } from "react-router-dom";
import heroImg from "../../assets/tech-mart1.webp";

const Hero = () => {
  console.log("Image path:", heroImg);

  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[750px] -mt-20">
      {/* Background Image */}
      <img
        src={heroImg}
        alt="Tech-mart"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay for contrast */}
      <div className="absolute inset-0  bg-opacity-40 z-10 pointer-events-none"></div>

      {/* Centered Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-center px-4">
        <h1 className="text-white text-5xl md:text-8xl font-bold uppercase tracking-tight mb-4">
          Vacation <br /> Ready
        </h1>
        <p className="text-white text-sm md:text-lg mb-6 max-w-xl">
          Explore our vacation-ready outfits with fast worldwide shipping
        </p>
        <Link
          to="#"
          className="bg-white text-gray-950 px-6 py-2 rounded-sm text-lg font-medium hover:bg-gray-200 transition"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
};

export default Hero;
