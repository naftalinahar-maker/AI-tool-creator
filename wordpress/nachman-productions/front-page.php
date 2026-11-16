<?php
/**
 * Home page – one-page site for Nachman Productions.
 *
 * @package nachman
 */

get_header();

$np_pkgs  = np_packages();
$np_price = $np_pkgs['single'][2];
$np_max   = max( 1, (int) np_opt( 'np_max_minutes' ) );
$np_auto  = (bool) np_opt( 'np_autoreply_on' );
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
	array( 'בוחרים חבילה', 'סרטון בודד או חבילה, ממלאים טופס קצר עם שם ומייל ומספרים על הסרטונים.' ),
	array( 'שולחים חומרים', 'נחמן חוזר אליכם במייל, ואתם משיבים עם הסרטונים, התמונות והמוזיקה (לקבצים גדולים: Google Drive או WeTransfer).' ),
	array( 'עורכים בשבילכם', 'נחמן עורך את הסרט: חיתוכים, מעברים, מוזיקה, כתוביות וצבע.' ),
	array( 'מקבלים סרט מוכן', 'מקבלים קובץ מוכן לצפייה ולשיתוף, ומשלמים לפי אורך הסרט בלבד.' ),
);

$np_faq = array(
	array( 'כמה זה עולה?', sprintf( 'סרטון בודד עולה %1$s. חבילת 10 סרטונים עולה %2$s, וחבילת 20 סרטונים עולה %3$s בלבד. החבילות מתאימות במיוחד לעסקים ולמי שמעלה תוכן לרשתות באופן קבוע.', np_money( $np_price ), np_money( $np_pkgs['pack10'][2] ), np_money( $np_pkgs['pack20'][2] ) ) ),
	array( 'אילו סרטים אפשר לערוך?', sprintf( 'כל סוגי הסרטים – אירועים, רשתות חברתיות, יוטיוב, עסקים, מזכרות ועוד – באורך של עד %d דקות לסרטון.', $np_max ) ),
	array( 'הסרט שלי ארוך מחצי שעה, מה עושים?', 'צרו קשר ונבדוק יחד – אפשר לחלק לכמה סרטים או למצוא פתרון אחר.' ),
	array( 'איך שולחים את החומרים?', 'אחרי שממלאים את הטופס נחמן חוזר אליכם במייל, ופשוט משיבים עליו עם החומרים. לקבצים גדולים הכי נוח קישור הורדה – Google Drive, WeTransfer או כל שירות שיתוף קבצים אחר.' ),
	array( 'באיזו איכות אקבל את הסרט?', 'עד 4K (אולטרה HD), בהתאם לאיכות החומרים שתשלחו. אפשר לבקש גם קובץ קל יותר לשיתוף ברשתות.' ),
	array( 'באילו כלים נחמן עובד?', 'נחמן משלב כמה כלים ביחד: CapCut, Canva, Clipchamp ו-Google Vids, יחד עם כלי בינה מלאכותית שמזרזים את העבודה ומשפרים את התוצאה.' ),
	array( 'כמה זמן לוקח לקבל את הסרט?', 'תלוי באורך הסרט ובכמות החומרים. כשתשלחו פרטים תקבלו הערכת זמן מדויקת.' ),
);

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
				<span class="hero__price-label">לסרטון<br><small>ובחבילה – עוד יותר זול.</small></span>
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
			<div><strong><?php echo np_money_html( $np_price ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></strong><span>לסרטון</span></div>
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

	<!-- ABOUT -->
	<section class="section section--dark" id="about">
		<div class="container about">
			<div class="about__media reveal">
				<?php $np_photo = np_opt( 'np_about_photo' ) ? np_opt( 'np_about_photo' ) : get_template_directory_uri() . '/assets/img/nachman.jpg?v=2'; ?>
				<img class="about__photo" src="<?php echo esc_url( $np_photo ); ?>" alt="נחמן פומברג" width="960" height="1200" loading="lazy">
				<span class="about__tag">Nachman Productions</span>
			</div>
			<div class="about__body">
				<p class="eyebrow">מי אני</p>
				<h2 class="section__title"><?php echo esc_html( np_opt( 'np_about_title' ) ); ?></h2>
				<div class="about__text"><?php echo wp_kses_post( wpautop( np_opt( 'np_about' ) ) ); ?></div>
				<ul class="about__facts">
					<li><strong>+60</strong><span>סרטים ערוכים</span></li>
					<li><strong>שנה</strong><span>של ניסיון</span></li>
					<li><strong>4</strong><span>כלי עריכה</span></li>
					<li><strong>4K</strong><span>איכות + AI</span></li>
				</ul>
				<a class="btn btn--fire" href="#contact">בואו נעבוד יחד</a>
			</div>
		</div>
	</section>

	<!-- TOOLS -->
	<section class="section" id="tools">
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
	<section class="section section--dark" id="pricing">
		<div class="container">
			<header class="section__head">
				<p class="eyebrow">מחירון</p>
				<h2 class="section__title">מחירים שקופים. <span class="text-fire">בלי אותיות קטנות.</span></h2>
				<p class="section__lead">כל סרטון עד <?php echo (int) $np_max; ?> דקות. ככה שיותר סרטונים, ככה כל סרטון יוצא זול יותר.</p>
			</header>

			<div class="plans">
				<?php foreach ( $np_pkgs as $key => $pkg ) : ?>
					<?php
					$per     = $pkg[1] > 0 ? $pkg[2] / $pkg[1] : 0;
					$save    = $pkg[1] * $np_price - $pkg[2];
					$is_best = 'pack20' === $key;
					?>
					<article class="plan reveal<?php echo $is_best ? ' plan--best' : ''; ?>">
						<?php if ( $is_best ) : ?><span class="plan__badge">הכי משתלם</span><?php endif; ?>
						<h3 class="plan__name"><?php echo esc_html( $pkg[0] ); ?></h3>
						<div class="plan__price"><?php echo np_money_html( $pkg[2] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
						<p class="plan__per">
							<?php if ( $pkg[1] > 1 ) : ?>
								<?php echo esc_html( np_money( round( $per, 2 ) ) ); ?> לסרטון
							<?php else : ?>
								לסרטון אחד
							<?php endif; ?>
						</p>
						<p class="plan__save"><?php echo $save > 0 ? esc_html( 'חוסכים ' . np_money( $save ) ) : '&nbsp;'; ?></p>
						<ul class="plan__list">
							<li><?php echo 1 === $pkg[1] ? 'סרטון אחד' : esc_html( $pkg[1] . ' סרטונים' ); ?>, כל אחד עד <?php echo (int) $np_max; ?> דקות</li>
							<li>עריכה מלאה בשילוב AI</li>
							<li>איכות עד 4K</li>
							<li>מוזיקה, כתוביות ומעברים</li>
						</ul>
						<a class="btn btn--block <?php echo $is_best ? 'btn--fire' : 'btn--ghost'; ?>" href="#contact" data-package="<?php echo esc_attr( $key ); ?>">אני רוצה את זה</a>
					</article>
				<?php endforeach; ?>
			</div>
			<p class="plans__note">🔥 המחירים הכי זולים בשוק 🔥</p>
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

	<!-- FAQ -->
	<section class="section section--dark" id="faq">
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
				<p class="section__lead"><?php echo $np_auto ? 'משאירים שם ומייל, ומיד מקבלים מייל עם הוראות. משיבים עליו עם החומרים לסרט, ונחמן מתחיל לעבוד.' : 'משאירים שם ומייל, ונחמן יחזור אליכם במייל עם כל הפרטים.'; ?></p>

				<?php if ( np_opt( 'np_wa_link' ) ) : ?>
					<a class="wa-cta" href="<?php echo esc_url( np_opt( 'np_wa_link' ) ); ?>" target="_blank" rel="noopener">
						<?php echo np_wa_icon( 52 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
						<span class="wa-cta__text"><strong>לפנייה ישירה בוואצאפ</strong><span>לחצו כאן</span></span>
					</a>
				<?php endif; ?>

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
					<p class="form__msg form__msg--ok" role="status"><?php echo $np_auto ? 'תודה! שלחנו לכם מייל. השיבו עליו עם החומרים לסרט (בדקו גם בתיקיית הספאם).' : 'תודה! הפנייה התקבלה, ונחמן יחזור אליכם במייל בהקדם.'; ?></p>
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
					<label class="field"><span>חבילה</span>
						<select name="np_package" id="form-package">
							<?php foreach ( $np_pkgs as $key => $pkg ) : ?>
								<option value="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $pkg[0] . ' – ' . np_money( $pkg[2] ) ); ?></option>
							<?php endforeach; ?>
						</select>
					</label>
				</div>
				<label class="field"><span>ספרו לנו על הסרט</span><textarea name="np_message" rows="4"></textarea></label>
				<button class="btn btn--fire btn--block" type="submit"><?php echo $np_auto ? 'שליחה – קבלו מייל עם הוראות' : 'שליחה'; ?></button>
			</form>
		</div>
	</section>

</main>

<?php
get_footer();
