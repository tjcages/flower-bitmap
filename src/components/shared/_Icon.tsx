import {
  Controls,
  Fingerprint,
  List,
  Lock,
  Next,
  Pause,
  Phone,
  Play,
  Previous,
  Profile,
  Send
} from "@/assets/icons";

interface Props {
  id?: string;
  icon:
    | "controls"
    | "next"
    | "pause"
    | "play"
    | "previous"
    | "list"
    | "profile"
    | "phone"
    | "send"
    | "lock"
    | "fingerprint";
  className?: string;
}

const _ = ({ id, icon, className }: Props) => {
  const render = () => {
    switch (icon) {
      case "controls":
        return <Controls id={id} className={className} />;
      case "next":
        return <Next id={id} className={className} />;
      case "pause":
        return <Pause id={id} className={className} />;
      case "play":
        return <Play id={id} className={className} />;
      case "previous":
        return <Previous id={id} className={className} />;
      case "list":
        return <List id={id} className={className} />;
      case "profile":
        return <Profile id={id} className={className} />;
      case "phone":
        return <Phone id={id} className={className} />;
      case "send":
        return <Send id={id} className={className} />;
      case "lock":
        return <Lock id={id} className={className} />;
      case "fingerprint":
        return <Fingerprint id={id} className={className} />;
      default:
        return null;
    }
  };

  return render();
};

export default _;
