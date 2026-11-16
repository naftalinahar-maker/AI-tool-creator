<?php
/**
 * Home page – one-page site for Nachman Productions.
 *
 * @package nachman
 */

get_header();

$np_price = (float) np_opt( 'np_price_per_block' );
$np_block = max( 1, (int) np_opt( 'np_block_minutes' ) );
$np_max   = max( 1, (int) np_opt( 'np_max_minutes' ) );
$np_sent  = isset( $_GET['np_sent'] ) ? sanitize_key( wp_unslash( $_GET['np_sent'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

$np_services = array(
	array( '🎉', 'אירועים ושמחות', 'חתונות, בר ובת מצווה, ימי הולדת, בריתות ואירועי משפחה – הופכים שעות של צילומים לסרט מרגש.' ),
	array( '📱', 'רילס, טיקטוק ושורטס', 'סרטונים קצרים וקצביים לרשתות, עם כתוביות, מוזיקה ומעברים שעוצרים את הגלילה.' ),
	array( '▶️', 'סרטוני יוטיוב', 'עריכה מלאה לסרטוני ערוץ: חיתוכים, גרפיקה, כתוביות, מוזיקה ותיקון צבע.' ),
	array( '💼', 'סרטוני תדמית לעסקים', 'סרטון שמציג את העסק שלכם בצורה מקצועית – לאתר, לרשתות ולפרסום.' ),
	array( '🖼️', 'מצגות תמונות ומזכרות', 'תמונות וקטעי וידאו שהופכים לסרט מזכרת עם מוזיקה – למתנה, לאזכרה או לאירוע.' ),
	array( '✈️', 'טיולים וחופשות', 'כל הקטעים מהטלפון מהחופשה הופכים לסרט אחד שכיף לראות שוב ושוב.' ),
	array( '🎓', 'הדרכות והרצאות', 'עריכת שיעורים, הרצאות וסרטוני הסבר – ברור, נקי וקל לצפייה.' ),
	array( '🎬', 'כל סרט אחר', 'יש לכם רעיון אחר? אם הסרט עד חצי שעה – אנחנו עורכים אותו.' ),
);

$np_steps = array(
	array( 'ממלאים טופס', 'משאירים שם ומייל ומספרים בקצרה על הסרט.' ),
	array( 'משיבים עם החומרים', 'מקבלים מייל אוטומטי ומשיבים עליו עם הסרטונים, התמונות והמוזיקה (לקבצים גדולים: Google Drive או WeTransfer).' ),
	array( 'עורכים בשבילכם', 'נחמן עורך את הסרט: חיתוכים, מעברים, מוזיקה, כתוביות וצבע.' ),
	array( 'מקבלים סרט מוכן', 'מקבלים קובץ מוכן לצפייה ולשיתוף, ומשלמים לפי אורך הסרט בלבד.' ),
);

$np_faq = array(
	array( 'איך מחושב המחיר?', sprintf( 'המחיר הוא %1$s לכל %2$d דקות של סרט, ומעגלים כלפי מעלה ליחידה הבאה. לדוגמה: סרט של %3$d דקות = %4$s.', np_money( $np_price ), $np_block, $np_block + 2, np_money( ceil( ( $np_block + 2 ) / $np_block ) * $np_price ) ) ),
	array( 'אילו סרטים אפשר לערוך?', sprintf( 'כל סוגי הסרטים – אירועים, רשתות חברתיות, יוטיוב, עסקים, מזכרות ועוד – באורך של עד %d דקות.', $np_max ) ),
	array( 'הסרט שלי ארוך מחצי שעה, מה עושים?', 'צרו קשר ונבדוק יחד – אפשר לחלק לכמה סרטים או למצוא פתרון אחר.' ),
	array( 'איך שולחים את החומרים?', 'אחרי שממלאים את הטופס מקבלים מייל, ופשוט משיבים עליו עם החומרים. לקבצים גדולים הכי נוח קישור הורדה – Google Drive, WeTransfer או כל שירות שיתוף קבצים אחר.' ),
	array( 'באיזו איכות אקבל את הסרט?', 'עד 4K (אולטרה HD), בהתאם לאיכות החומרים שתשלחו. אפשר לבקש גם קובץ קל יותר לשיתוף ברשתות.' ),
	array( 'באילו כלים נחמן עובד?', 'נחמן משלב כמה כלים ביחד: CapCut, Canva, Clipchamp ו-Google Vids, יחד עם כלי בינה מלאכותית שמזרזים את העבודה ומשפרים את התוצאה.' ),
	array( 'כמה זמן לוקח לקבל את הסרט?', 'תלוי באורך הסרט ובכמות החומרים. כשתשלחו פרטים תקבלו הערכת זמן מדויקת.' ),
);

$np_videos = array_filter( preg_split( '/\r\n|\r|\n/', (string) np_opt( 'np_videos' ) ) );
?>

<main id="main">

	<!-- HERO -->
	<section class="hero" style="--hero-img:url('<?php echo np_img( 'hero.jpg' ); ?>')">
		<div class="hero__embers" aria-hidden="true"></div>
		<div class="container hero__inner">
			<p class="eyebrow">נחמן הפקות · Nachman Productions</p>
			<h1 class="hero__title"><?php echo esc_html( np_opt( 'np_tagline' ) ); ?></h1>
			<p class="hero__text"><?php echo esc_html( np_opt( 'np_hero_text' ) ); ?></p>

			<div class="hero__price">
				<span class="hero__price-num"><?php echo np_money_html( $np_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				<span class="hero__price-label">לכל <?php echo (int) $np_block; ?> דקות סרט<br><small>זיל הזול – באמת.</small></span>
			</div>

			<div class="hero__actions">
				<a class="btn btn--fire" href="#contact">הזמינו עריכה עכשיו</a>
				<a class="btn btn--ghost" href="#pricing">חשבו מחיר</a>
			</div>
		</div>
		<a class="hero__scroll" href="#services" aria-label="גללו למטה"><span></span></a>
	</section>

	<!-- STRIP -->
	<div class="strip">
		<div class="container strip__inner">
			<div><strong>כל</strong><span>סוגי הסרטים</span></div>
			<div><strong>עד <?php echo (int) $np_max; ?></strong><span>דקות לסרט</span></div>
			<div><strong>AI</strong><span>עריכה משולבת בינה מלאכותית</span></div>
			<div><strong><?php echo np_money_html( $np_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></strong><span>ל-<?php echo (int) $np_block; ?> דקות</span></div>
			<div><strong>4K</strong><span>איכות אולטרה HD</span></div>
		</div>
	</div>

	<!-- SERVICES -->
	<section class="section" id="services">
		<div class="container">
			<header class="section__head">
				<p class="eyebrow">מה אנחנו עורכים</p>
				<h2 class="section__title">כל סוג של סרט. <span class="text-fire">עד חצי שעה.</span></h2>
				<p class="section__lead">לא משנה אם צילמתם בטלפון או במצלמה מקצועית – שולחים חומרים ומקבלים סרט ערוך, מוכן לצפייה ולשיתוף.</p>
			</header>
			<div class="grid grid--4">
				<?php foreach ( $np_services as $s ) : ?>
					<article class="card reveal">
						<div class="card__icon" aria-hidden="true"><?php echo esc_html( $s[0] ); ?></div>
						<h3 class="card__title"><?php echo esc_html( $s[1] ); ?></h3>
						<p class="card__text"><?php echo esc_html( $s[2] ); ?></p>
					</article>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<!-- TOOLS -->
	<section class="section section--dark" id="tools">
		<div class="container tools">
			<div class="tools__info">
				<p class="eyebrow">איך זה זול ומקצועי בו זמנית?</p>
				<h2 class="section__title">עריכה משולבת <span class="text-fire">AI</span>, באיכות <span class="text-fire">4K</span></h2>
				<p class="section__lead">נחמן משלב כמה כלי עריכה מובילים ביחד ומשתמש בבינה מלאכותית כדי לעבוד מהר ומדויק. ככה המחיר נשאר נמוך והתוצאה נראית מקצועית.</p>
				<ul class="checks">
					<li>ייצוא באיכות 4K</li>
					<li>כתוביות אוטומטיות בעזרת AI</li>
					<li>שיפור סאונד ותמונה חכם</li>
					<li>אפקטים, טקסטים וגרפיקה</li>
				</ul>
			</div>
			<div class="tools__grid" role="list" aria-label="כלי העריכה שנחמן עובד איתם">
				<?php foreach ( array( array( 'CapCut', 'עריכה, אפקטים ומעברים' ), array( 'Canva', 'עיצוב, גרפיקה וטקסטים' ), array( 'Clipchamp', 'עריכה וכתוביות' ), array( 'Google Vids', 'סרטונים בעזרת AI' ) ) as $t ) : ?>
					<div class="tool reveal" role="listitem">
						<span class="tool__name"><?php echo esc_html( $t[0] ); ?></span>
						<span class="tool__desc"><?php echo esc_html( $t[1] ); ?></span>
					</div>
				<?php endforeach; ?>
				<div class="tool tool--badge reveal" role="listitem"><span class="tool__name">4K</span><span class="tool__desc">Ultra HD</span></div>
				<div class="tool tool--badge reveal" role="listitem"><span class="tool__name">AI</span><span class="tool__desc">בינה מלאכותית</span></div>
			</div>
		</div>
	</section>

	<!-- PRICING -->
	<section class="section" id="pricing">
		<div class="container pricing">
			<div class="pricing__info">
				<p class="eyebrow">מחיר אחד, פשוט ושקוף</p>
				<h2 class="section__title"><?php echo esc_html( np_money( $np_price ) ); ?> לכל <?php echo (int) $np_block; ?> דקות.<br><span class="text-fire">זהו. בלי אותיות קטנות.</span></h2>
				<p class="section__lead">משלמים רק לפי אורך הסרט. בלי חבילות ובלי תוספות מפתיעות.</p>
				<ul class="checks">
					<li>חיתוך ועריכה מלאה</li>
					<li>מוזיקה ומעברים</li>
					<li>כתוביות וטקסטים</li>
					<li>תיקון צבע וסאונד</li>
					<li>איכות 4K</li>
					<li>שיפורים בעזרת AI</li>
				</ul>
			</div>

			<div class="calc reveal" aria-labelledby="calc-title">
				<h3 id="calc-title" class="calc__title">מחשבון מחיר</h3>
				<label class="calc__label" for="calc-minutes">כמה דקות יהיה הסרט?</label>
				<input class="calc__range" id="calc-minutes" type="range" min="1" max="<?php echo (int) $np_max; ?>" value="<?php echo (int) min( 10, $np_max ); ?>" step="1">
				<div class="calc__row">
					<span><output id="calc-min-out"><?php echo (int) min( 10, $np_max ); ?></output> דקות</span>
					<span class="calc__total" id="calc-total"><?php echo np_money_html( ceil( min( 10, $np_max ) / $np_block ) * $np_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
				</div>
				<p class="calc__note">מעוגל כלפי מעלה ליחידה של <?php echo (int) $np_block; ?> דקות.</p>
				<a class="btn btn--fire btn--block" href="#contact" id="calc-cta">אני רוצה את זה</a>

				<table class="calc__table">
					<caption class="screen-reader-text">דוגמאות למחירים</caption>
					<tbody>
					<?php foreach ( array_unique( array( $np_block, 2 * $np_block, 3 * $np_block, $np_max ) ) as $m ) : ?>
						<?php
						if ( $m > $np_max ) {
							continue;
						}
						?>
						<tr><td>סרט של <?php echo (int) $m; ?> דקות</td><td><?php echo esc_html( np_money( ceil( $m / $np_block ) * $np_price ) ); ?></td></tr>
					<?php endforeach; ?>
					</tbody>
				</table>
			</div>
		</div>
	</section>

	<!-- PROCESS -->
	<section class="section" id="process">
		<div class="container">
			<header class="section__head">
				<p class="eyebrow">איך זה עובד</p>
				<h2 class="section__title">4 צעדים לסרט מוכן</h2>
			</header>
			<ol class="steps">
				<?php foreach ( $np_steps as $i => $step ) : ?>
					<li class="step reveal">
						<span class="step__num"><?php echo (int) ( $i + 1 ); ?></span>
						<h3 class="step__title"><?php echo esc_html( $step[0] ); ?></h3>
						<p class="step__text"><?php echo esc_html( $step[1] ); ?></p>
					</li>
				<?php endforeach; ?>
			</ol>
		</div>
	</section>

	<!-- WORK -->
	<section class="section section--dark" id="work">
		<div class="container">
			<header class="section__head">
				<p class="eyebrow">תיק עבודות</p>
				<h2 class="section__title">קצת ממה שערכנו</h2>
			</header>
			<?php if ( $np_videos ) : ?>
				<div class="grid grid--3 work">
					<?php foreach ( $np_videos as $url ) : ?>
						<?php $embed = wp_oembed_get( esc_url( $url ) ); ?>
						<?php if ( $embed ) : ?>
							<div class="work__item reveal"><?php echo $embed; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- oEmbed HTML from WordPress. ?></div>
						<?php endif; ?>
					<?php endforeach; ?>
				</div>
			<?php else : ?>
				<div class="work__empty">
					<p>סרטים לדוגמה יעלו לכאן בקרוב.</p>
					<?php if ( current_user_can( 'edit_theme_options' ) ) : ?>
						<p class="work__hint">מנהל/ת: הוסיפו קישורי יוטיוב בהתאמה אישית ← פרטי העסק ← תיק עבודות.</p>
					<?php endif; ?>
				</div>
			<?php endif; ?>
		</div>
	</section>

	<?php if ( np_opt( 'np_about' ) ) : ?>
	<!-- ABOUT -->
	<section class="section" id="about">
		<div class="container about">
			<p class="eyebrow">נעים מאוד</p>
			<h2 class="section__title">קצת עליי</h2>
			<div class="about__text"><?php echo wp_kses_post( wpautop( np_opt( 'np_about' ) ) ); ?></div>
		</div>
	</section>
	<?php endif; ?>

	<!-- FAQ -->
	<section class="section" id="faq">
		<div class="container container--narrow">
			<header class="section__head">
				<p class="eyebrow">שאלות נפוצות</p>
				<h2 class="section__title">יש שאלות? יש תשובות</h2>
			</header>
			<div class="faq">
				<?php foreach ( $np_faq as $i => $q ) : ?>
					<details class="faq__item"<?php echo 0 === $i ? ' open' : ''; ?>>
						<summary><?php echo esc_html( $q[0] ); ?></summary>
						<p><?php echo esc_html( $q[1] ); ?></p>
					</details>
				<?php endforeach; ?>
			</div>
		</div>
	</section>

	<!-- CONTACT -->
	<section class="section section--fire" id="contact">
		<div class="container contact">
			<div class="contact__info">
				<p class="eyebrow">בואו נתחיל</p>
				<h2 class="section__title">מוכנים לסרט שלכם?</h2>
				<p class="section__lead">משאירים שם ומייל, ומיד מקבלים מייל עם הוראות. משיבים עליו עם החומרים לסרט, ונחמן מתחיל לעבוד.</p>

				<ul class="contact__list">
					<?php if ( np_opt( 'np_email' ) ) : ?>
						<li>✉️ <a href="mailto:<?php echo esc_attr( np_opt( 'np_email' ) ); ?>"><?php echo esc_html( np_opt( 'np_email' ) ); ?></a></li>
					<?php endif; ?>
					<?php if ( np_opt( 'np_area' ) ) : ?>
						<li>📍 <?php echo esc_html( np_opt( 'np_area' ) ); ?></li>
					<?php endif; ?>
				</ul>
			</div>

			<form class="form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php if ( '1' === $np_sent ) : ?>
					<p class="form__msg form__msg--ok" role="status">תודה! שלחנו לכם מייל. השיבו עליו עם החומרים לסרט (בדקו גם בתיקיית הספאם).</p>
				<?php elseif ( 'missing' === $np_sent ) : ?>
					<p class="form__msg form__msg--err" role="alert">צריך למלא שם וכתובת מייל תקינה.</p>
				<?php elseif ( 'error' === $np_sent ) : ?>
					<p class="form__msg form__msg--err" role="alert">משהו השתבש בשליחה. נסו שוב או פנו אלינו ישירות.</p>
				<?php endif; ?>

				<input type="hidden" name="action" value="np_contact">
				<?php wp_nonce_field( 'np_contact', 'np_nonce' ); ?>
				<div class="form__hp" aria-hidden="true"><label>אתר <input type="text" name="np_website" tabindex="-1" autocomplete="off"></label></div>

				<div class="form__row">
					<label class="field"><span>שם מלא *</span><input type="text" name="np_name" required autocomplete="name"></label>
					<label class="field"><span>אימייל *</span><input type="email" name="np_email" required autocomplete="email" inputmode="email" dir="ltr"></label>
				</div>
				<div class="form__row">
					<label class="field"><span>סוג הסרט</span>
						<select name="np_type">
							<option value="">בחרו…</option>
							<?php foreach ( $np_services as $s ) : ?>
								<option><?php echo esc_html( $s[1] ); ?></option>
							<?php endforeach; ?>
						</select>
					</label>
					<label class="field"><span>אורך משוער (דקות)</span><input type="number" name="np_length" id="form-length" min="1" max="<?php echo (int) $np_max; ?>" inputmode="numeric"></label>
				</div>
				<label class="field"><span>ספרו לנו על הסרט</span><textarea name="np_message" rows="4"></textarea></label>
				<button class="btn btn--fire btn--block" type="submit">שליחה – קבלו מייל עם הוראות</button>
			</form>
		</div>
	</section>

</main>

<?php
get_footer();
