const Loader = () => (
  <div className="flex h-screen w-screen flex-col items-center justify-center gap-2">
    <img src="/assets/loader.gif" alt="loader" className="h-24 w-24 object-contain" />
    <p className="text-sm font-bold text-primary-grey-300">Loading...</p>
  </div>
);

export default Loader;
