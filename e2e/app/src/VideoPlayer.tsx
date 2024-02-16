import { useCallback} from "react";

type Props = {
  stream?: MediaStream;
  id?: string;
};

export const VideoPlayer = ({ stream, id }: Props) => {
  // const heartRef = useRef<HTMLVideoElement>(null);

  // useEffect(() => {
  //   if (!heartRef.current) return;
  //   console.log("Replacing!")
  //   heartRef.current.srcObject = stream || null;
  // }, [stream]);

  const loadMedia = useCallback(
      (media: HTMLAudioElement | null) => {
        if (!media) return;
        media.srcObject = stream || null;
      },
      [stream],
  );

  return <video id={id} style={{ maxHeight: "200px" }} autoPlay playsInline controls={false} muted ref={loadMedia} />;
};
