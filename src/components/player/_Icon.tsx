import { Controls, List, Next, Pause, Phone, Play, Previous, Profile, Send } from "@/assets/icons";

interface Props {
  icon: "controls" | "next" | "pause" | "play" | "previous" | "list" | "profile" | "phone" | "send";
  className?: string;
}

const _ = ({ icon, className }: Props) => {
  const render = () => {
    switch (icon) {
      case "controls":
        return <Controls className={className} />;
      case "next":
        return <Next className={className} />;
      case "pause":
        return <Pause className={className} />;
      case "play":
        return <Play className={className} />;
      case "previous":
        return <Previous className={className} />;
      case "list":
        return <List className={className} />;
      case "profile":
        return <Profile className={className} />;
      case "phone":
        return <Phone className={className} />;
      case "send":
        return <Send className={className} />;
      default:
        return null;
    }
  };

  return render();
};

export default _;
