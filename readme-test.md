# Thoughts

It's possible to test some logic without browser, but when it comes to `RTCPeerConnection` this API is only available
in Browsers. We could either use browser or mock this object.

## Mocking Browser API (RTCPeerConnection)
Pros:
+ Faster tests
+ Tests doesn't depend on current browser version
Cons:
- Mocking is challenging. We can make many mistakes when mocking, and we can make incorrect assumptions.

## Running in browser
Props:
+ testing real API
Cons:
- more complicated test
- test depends on current browser version
