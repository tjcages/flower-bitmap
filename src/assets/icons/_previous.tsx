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
        d="M47.4274 58C48.6894 58 49.9797 57.6644 51.1295 57.0213C53.5416 55.679 55 53.2183 55 50.4499V7.55416C55 4.84179 53.5977 2.40896 51.2698 1.03882C48.9139 -0.303408 46.1092 -0.359334 43.7533 0.954928L6.90024 21.3675C4.51631 22.6818 3.05788 25.0865 3.00169 27.799C2.94551 30.5114 4.29184 32.9721 6.61968 34.3983L43.4727 56.8528C44.7068 57.6358 46.0531 58 47.4274 58ZM47.4274 5.59773C47.8761 5.59773 48.2407 5.76551 48.4371 5.87736C48.7175 6.04514 49.4187 6.54847 49.4187 7.55514V50.4222C49.4187 51.4568 48.7176 51.9603 48.409 52.1279C48.1005 52.2956 47.3152 52.6313 46.4177 52.1L9.56464 29.6454C8.69519 29.1141 8.61105 28.2753 8.63914 27.9397C8.66723 27.6042 8.75133 26.7653 9.64883 26.262L46.474 5.8494C46.8106 5.65366 47.1469 5.59773 47.4274 5.59773Z"
        fill="currentColor"
      />
      <path
        d="M3 58C4.65685 58 6 56.6569 6 55V3C6 1.34315 4.65685 0 3 0C1.34315 0 0 1.34315 0 3V55C0 56.6569 1.34315 58 3 58Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default _;
