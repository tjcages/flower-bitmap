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
      width="55"
      height="58"
      viewBox="0 0 55 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.57263 58C6.31057 58 5.02033 57.6644 3.87046 57.0213C1.45843 55.679 0 53.2183 0 50.4499V7.55416C0 4.84179 1.40234 2.40896 3.73018 1.03882C6.08611 -0.303408 8.89079 -0.359334 11.2467 0.954928L48.0998 21.3675C50.4837 22.6818 51.9421 25.0865 51.9983 27.799C52.0545 30.5114 50.7082 32.9721 48.3803 34.3983L11.5273 56.8528C10.2932 57.6358 8.94688 58 7.57263 58ZM7.57263 5.59773C7.12389 5.59773 6.75928 5.76551 6.56295 5.87736C6.28248 6.04514 5.58127 6.54847 5.58127 7.55514V50.4222C5.58127 51.4568 6.28244 51.9603 6.59095 52.1279C6.89947 52.2956 7.68482 52.6313 8.58232 52.1L45.4354 29.6454C46.3048 29.1141 46.389 28.2753 46.3609 27.9397C46.3328 27.6042 46.2487 26.7653 45.3512 26.262L8.52596 5.8494C8.1894 5.65366 7.8531 5.59773 7.57263 5.59773Z"
        fill="currentColor"
      />
      <path
        d="M52 58C50.3431 58 49 56.6569 49 55V3C49 1.34315 50.3431 0 52 0C53.6569 0 55 1.34315 55 3V55C55 56.6569 53.6569 58 52 58Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default _;