import NavBar from "./ui/navbar";

export default function Home() {
  return (
    <main className="min-h-screen transition-colors">
      <NavBar />
      <section className="flex flex-col items-center justify-center py-24 px-4">
        <h1 className="text-3xl sm:text-6xl font-extrabold mb-6 text-center">
          Welcome to HappyQuest!
        </h1>
        <p className="text-lg sm:text-2xl mb-8 text-center max-w-2xl">
          Empower your family to build healthy habits, celebrate achievements,
          and grow together. Track progress, reward positive actions, and make
          every day a HappyQuest!
        </p>
        <div className="flex gap-4">
          <a
            href="/login"
            className="btn w-full bg-gradient-to-r from-blue-200 to-blue-300 text-white p-6 rounded-lg flex items-center justify-center transition-transform hover:scale-105 shadow-2xl mt-4 text-2xl"
          >
            Get started
          </a>
        </div>
      </section>
    </main>
  );
}
