const cache_name="offline_V1";

const resources = [
    "manifest.json",
    "/styles/storytelling.css",
    "/",
    "/index.html",
];


self.addEventListener("install", (installing) => {
  installing.waitUntil(
    caches.open(cache_name).then((cache) => {
      console.log("Service Worker: Caching important offline files");
      return Promise.all(
        resources.map((resource) =>
          cache.add(resource).catch((err) =>
            console.error(`Failed to cache ${resource}:`, err)
          )
        )
      );
    })
  );
});

  self.addEventListener("activate",(activating)=>{	
    console.log("Service Worker: All systems online, ready to go!");
  });
  
  self.addEventListener("fetch",(fetching)=>{   
    console.log("Service Worker: User threw a ball, I need to fetch it!");
  });
  
  self.addEventListener("push",(pushing)=>{
      console.log("Service Worker: I received some push data, but because I am still very simple I don't know what to do with it :(");
  })
  