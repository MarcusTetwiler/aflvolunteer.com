import { AUTHOR, BOOK } from '../site.config';
import './AuthorSection.css';

// Renders a paragraph with any mention of the book's title set in italics,
// so the config can stay plain text.
function BioParagraph({ text }) {
  const parts = text.split(BOOK.title);
  if (parts.length === 1) return <p className="author__bio">{text}</p>;

  return (
    <p className="author__bio">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <em>{BOOK.title}</em>}
        </span>
      ))}
    </p>
  );
}

export default function AuthorSection() {
  const hasPhoto = Boolean(AUTHOR.photo);

  return (
    <section className="author" id="author">
      <div className={`container author__inner${hasPhoto ? ' author__inner--with-photo' : ''}`}>
        {hasPhoto && (
          <div className="author__portrait-wrap">
            <img
              className="author__portrait"
              src={AUTHOR.photo}
              alt={AUTHOR.name}
              loading="lazy"
            />
          </div>
        )}

        <div className="author__copy">
          <p className="eyebrow">About the Author</p>
          <h2 className="author__name">{AUTHOR.name}</h2>

          {AUTHOR.bio.map((para, i) => (
            <BioParagraph key={i} text={para} />
          ))}

          {AUTHOR.contactEmail && (
            <a className="author__contact" href={`mailto:${AUTHOR.contactEmail}`}>
              {AUTHOR.contactLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
