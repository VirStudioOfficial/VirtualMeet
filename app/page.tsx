export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-6xl font-bold mb-4">
        Virtual Meet
      </h1>

      <p className="text-gray-400 text-xl mb-8">
        جلسات آنلاین سریع و حرفه‌ای
      </p>

      <div className="flex gap-4">
        <button className="bg-white text-black px-6 py-3 rounded-xl">
          ساخت جلسه
        </button>

        <button className="border border-white px-6 py-3 rounded-xl">
          ورود به جلسه
        </button>
      </div>
    </main>
  );
}
