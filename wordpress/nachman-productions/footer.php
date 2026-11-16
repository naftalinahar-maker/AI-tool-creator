<?php
/**
 * Site footer.
 *
 * @package nachman
 */

$np_wa      = np_whatsapp_url( 'היי נחמן, אשמח לפרטים על עריכת סרט' );
$np_socials = array_filter(
	array(
		'אינסטגרם' => np_opt( 'np_instagram' ),
		'טיקטוק'   => np_opt( 'np_tiktok' ),
		'יוטיוב'   => np_opt( 'np_youtube' ),
		'פייסבוק'  => np_opt( 'np_facebook' ),
	)
);
?>
<footer class="site-footer">
	<div class="container site-footer__inner">
		<div class="site-footer__brand">
			<img src="<?php echo np_img( 'logo.jpg' ); ?>" alt="נחמן הפקות" width="800" height="270" loading="lazy">
			<p>עריכת סרטים לכל מטרה, עד חצי שעה, במחיר הכי זול שיש.</p>
		</div>

		<div>
			<h3 class="site-footer__title">ניווט</h3>
			<?php np_fallback_menu(); ?>
		</div>

		<div>
			<h3 class="site-footer__title">יצירת קשר</h3>
			<ul class="site-footer__list">
				<?php if ( np_opt( 'np_phone' ) ) : ?>
					<li><a href="tel:<?php echo esc_attr( preg_replace( '/[^\d+]/', '', np_opt( 'np_phone' ) ) ); ?>"><?php echo esc_html( np_opt( 'np_phone' ) ); ?></a></li>
				<?php endif; ?>
				<?php if ( np_opt( 'np_email' ) ) : ?>
					<li><a href="mailto:<?php echo esc_attr( np_opt( 'np_email' ) ); ?>"><?php echo esc_html( np_opt( 'np_email' ) ); ?></a></li>
				<?php endif; ?>
				<?php if ( $np_wa ) : ?>
					<li><a href="<?php echo esc_url( $np_wa ); ?>" target="_blank" rel="noopener">וואטסאפ</a></li>
				<?php endif; ?>
				<?php foreach ( $np_socials as $label => $url ) : ?>
					<li><a href="<?php echo esc_url( $url ); ?>" target="_blank" rel="noopener"><?php echo esc_html( $label ); ?></a></li>
				<?php endforeach; ?>
				<?php if ( ! np_opt( 'np_phone' ) && ! np_opt( 'np_email' ) && ! $np_wa ) : ?>
					<li><a href="<?php echo esc_url( home_url( '/#contact' ) ); ?>">השאירו פרטים בטופס</a></li>
				<?php endif; ?>
			</ul>
		</div>
	</div>
	<div class="container site-footer__bottom">
		<span>© <?php echo esc_html( wp_date( 'Y' ) ); ?> נחמן הפקות · Nachman Productions</span>
		<a href="#top">חזרה למעלה ↑</a>
	</div>
</footer>

<?php if ( $np_wa ) : ?>
	<a class="wa-float" href="<?php echo esc_url( $np_wa ); ?>" target="_blank" rel="noopener" aria-label="שלחו הודעה בוואטסאפ">
		<svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7 0a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.9 1 3.9.8a3.3 3.3 0 0 0 2.2-1.5 2.7 2.7 0 0 0 .2-1.6c-.1-.2-.3-.3-.7-.5z"/></svg>
	</a>
<?php endif; ?>

<?php wp_footer(); ?>
</body>
</html>
