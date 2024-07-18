import { cn } from "@/utils";

interface Props {
  id?: string;
  className?: string;
}

const _ = ({ id, className }: Props) => {
  return (
    <svg
      id={id}
      className={cn(className)}
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28.0205 30.0109C19.7341 30.0109 13.0092 23.2886 13.0092 15.0055C13.0092 6.7223 19.7341 0 28.0205 0C36.3069 0 43.0318 6.7223 43.0318 15.0055C43.0318 23.2886 36.3069 30.0109 28.0205 30.0109ZM28.0205 4.00201C21.956 4.00201 17.0121 8.94374 17.0121 15.0061C17.0121 21.0685 21.9558 26.0102 28.0205 26.0102C34.0852 26.0102 39.0289 21.0685 39.0289 15.0061C39.0289 8.94374 34.0852 4.00201 28.0205 4.00201ZM28.0205 56C18.8541 56 9.70694 52.5188 2.72199 45.5363C0.960703 43.7756 0 41.4349 0 38.9542C0 36.4734 0.960703 34.1125 2.72199 32.3721C4.50326 30.6115 6.84501 29.6312 9.3265 29.6312C11.8283 29.6312 14.17 30.6115 15.9112 32.3721C19.1335 35.5931 23.4367 37.3738 28.0199 37.3738C32.603 37.3738 36.8865 35.5932 40.1087 32.3721C41.87 30.6115 44.2117 29.6511 46.6934 29.6511C49.175 29.6511 51.5369 30.6115 53.278 32.3721C55.0393 34.1327 56 36.4734 56 38.9542C56 41.4349 55.0393 43.7958 53.278 45.5363C46.3129 52.4986 37.1459 56 27.9795 56H28.0205ZM9.3265 33.632C7.90543 33.632 6.56448 34.1922 5.56375 35.1925C4.54297 36.2129 4.00261 37.5333 4.00261 38.9738C4.00261 40.4143 4.56302 41.7348 5.56375 42.7351C17.953 55.1195 38.1072 55.1195 50.4965 42.7351C51.4972 41.7348 52.0576 40.3943 52.0576 38.9738C52.0576 37.5533 51.4972 36.2129 50.4965 35.2125C48.495 33.2118 44.9724 33.2118 42.9709 35.2125C38.988 39.1939 33.6842 41.3946 28.0403 41.3946C22.3965 41.3946 17.0922 39.1939 13.1097 35.2125C12.109 34.2122 10.7681 33.652 9.347 33.652L9.3265 33.632Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default _;
