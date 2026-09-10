///
/// Image
///

interface Props {
  image: string;
}

const Image = ({ image }: Props) => {
  const src = new URL(`../images/${image}`, import.meta.url).href;

  return (
    <article className="panel image-panel">
      <header className="panel-header">
        <div>
          <span className="panel-eyebrow">Visual input</span>
          <h2>Reference image</h2>
        </div>
        <span className="panel-file-name">{image}</span>
      </header>

      <div className="image-stage">
        <img className="responsive-image" src={src} alt={image} />
      </div>
    </article>
  );
};

export default Image;
