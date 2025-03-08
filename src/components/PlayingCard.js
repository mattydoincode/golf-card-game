export default function PlayingCard({ card }) {
  return <img className="card" src={`cards/${card.imgVal()}.svg`} />;
}
