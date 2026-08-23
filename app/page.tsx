export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold mb-4">
        Virtual Meet
      </h1>

      <p className="text-gray-400 text-xl text-center max-w-xl mb-8">
        جلسات آنلاین سریع، ساده و حرفه‌ای برای همه
      </p>

      <div className="flex gap-4">
        <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold">
          ساخت جلسه
        </button>

        <button className="border border-white px-6 py-3 rounded-xl font-semibold">
          ورود به جلسه
        </button>
      </div>
    </main>
  );
}
