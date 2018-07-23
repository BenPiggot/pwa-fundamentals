self.addEventListener('install', event => {
  console.log("I'm installing");
});

self.addEventListener('activate', event => {
  console.log("I'm alive!");
});

self.addEventListener('fetch', event => {
  console.log('Someone tried to fetch something');
}); 