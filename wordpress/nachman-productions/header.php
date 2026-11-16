<?php
/**
 * Site header.
 *
 * @package nachman
 */
?><!doctype html>
<html dir="rtl" lang="he-IL">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="theme-color" content="#0b0807">
	<meta name="description" content="נחמן הפקות – עריכת סרטים מקצועית לכל סוגי הסרטים עד חצי שעה, במחירים הכי זולים שיש.">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="skip-link" href="#main">דלג לתוכן</a>

<header class="site-header" id="top">
	<div class="container site-header__inner">
		<a class="brand" href="<?php echo esc_url( home_url( '/' ) ); ?>" aria-label="נחמן הפקות – דף הבית">
			<?php if ( has_custom_logo() ) : ?>
				<?php echo wp_get_attachment_image( get_theme_mod( 'custom_logo' ), 'medium', false, array( 'class' => 'brand__logo', 'alt' => 'נחמן הפקות' ) ); ?>
			<?php else : ?>
				<img class="brand__logo" src="<?php echo np_img( 'logo.jpg' ); ?>" alt="Nachman Productions – נחמן הפקות" width="800" height="270">
			<?php endif; ?>
			<span class="brand__name">נחמן הפקות</span>
		</a>

		<button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">
			<span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span>
			<span class="screen-reader-text">תפריט</span>
		</button>

		<nav class="nav" id="site-nav" aria-label="תפריט ראשי">
			<?php
			wp_nav_menu(
				array(
					'theme_location' => 'primary',
					'container'      => false,
					'menu_class'     => 'nav__list',
					'fallback_cb'    => 'np_fallback_menu',
					'depth'          => 1,
				)
			);
			?>
			<a class="btn btn--fire btn--sm nav__cta" href="<?php echo esc_url( home_url( '/#contact' ) ); ?>">הזמינו עריכה</a>
		</nav>
	</div>
</header>
